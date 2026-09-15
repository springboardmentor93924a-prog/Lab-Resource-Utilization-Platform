package com.labresource.backend.booking.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.booking.dto.BookingApprovalDto;
import com.labresource.backend.booking.dto.BookingDto;
import com.labresource.backend.booking.dto.BookingRequestDto;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.service.SharingService;
import com.labresource.backend.waitlist.service.WaitlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingApprovalWorkflowTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock
    private EquipmentService equipmentService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private BookingAgreementService bookingAgreementService;
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private LaboratoryRepository laboratoryRepository;
    @Mock
    private WaitlistService waitlistService;
    @Mock
    private SharingService sharingService;
    @Mock
    private SharedBookingRepository sharedBookingRepository;

    @InjectMocks
    private BookingService bookingService;

    private Equipment testEquipment;
    private AppUser studentUser;
    private AppUser managerUser;

    @BeforeEach
    public void setup() {
        testEquipment = new Equipment();
        testEquipment.setEquipmentId(101L);
        testEquipment.setName("Confocal Laser Scanning Microscope");
        testEquipment.setSerialNumber("SN-MIC-9000");
        testEquipment.setHourlyRate(BigDecimal.valueOf(150.00));
        testEquipment.setStatus(Equipment.AVAILABLE);
        testEquipment.setInstitutionId(6L);
        testEquipment.setDepartmentId(21L);

        studentUser = new AppUser();
        studentUser.setUserId(501L);
        studentUser.setFirstName("Alice");
        studentUser.setLastName("Student");
        studentUser.setEmail("alice.student@kce.ac.in");
        studentUser.setInstitutionId(6L);
        studentUser.setDepartmentId(21L);

        managerUser = new AppUser();
        managerUser.setUserId(601L);
        managerUser.setFirstName("Bob");
        managerUser.setLastName("Manager");
        managerUser.setEmail("bob.manager@kce.ac.in");
        managerUser.setInstitutionId(6L);
        managerUser.setDepartmentId(21L);
    }

    @Test
    public void createBooking_RequiresAgreementAcceptance() {
        BookingRequestDto request = new BookingRequestDto();
        request.setEquipmentId(101L);
        request.setStartTime(LocalDateTime.now().plusDays(1));
        request.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        request.setAgreementAccepted(false); // not accepted

        ApiException ex = assertThrows(ApiException.class, () ->
                bookingService.createBooking(501L, 6L, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("accept the laboratory safety and usage agreement"));
    }

    @Test
    public void createBooking_Success_PersistsAgreementAndSetsPendingApproval() {
        BookingRequestDto request = new BookingRequestDto();
        request.setEquipmentId(101L);
        request.setStartTime(LocalDateTime.now().plusDays(1));
        request.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        request.setPurpose("Cell morphology analysis");
        request.setAgreementAccepted(true);
        request.setAgreementVersion("2026.1");

        when(equipmentService.getEntity(101L)).thenReturn(testEquipment);
        when(equipmentService.hasValidCalibration(101L)).thenReturn(true);
        when(bookingRepository.findOverlapping(eq(101L), any(), any(), any())).thenReturn(Collections.emptyList());
        when(maintenanceRequestRepository.findByEquipmentIdAndStatusNot(eq(101L), anyString())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setBookingId(1L);
            return b;
        });

        BookingDto result = bookingService.createBooking(501L, 6L, request);

        assertNotNull(result);
        assertEquals(Booking.PENDING_APPROVAL, result.getStatus());
        assertEquals("Confocal Laser Scanning Microscope", result.getEquipmentName());
        verify(notificationService).notifyDepartmentLabManagers(eq(21L), eq("BOOKING_REQUEST"), anyString(), anyString());
    }

    @Test
    public void approveBooking_Success_ByAuthorizedManager() {
        Booking booking = new Booking();
        booking.setBookingId(201L);
        booking.setEquipmentId(101L);
        booking.setUserId(501L);
        booking.setInstitutionId(6L);
        booking.setDepartmentId(21L);
        booking.setStatus(Booking.PENDING_APPROVAL);
        booking.setStartTime(LocalDateTime.now().plusDays(1));
        booking.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(equipmentService.getEntity(101L)).thenReturn(testEquipment);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(appUserRepository.findById(501L)).thenReturn(Optional.of(studentUser));
        when(appUserRepository.findById(601L)).thenReturn(Optional.of(managerUser));

        BookingApprovalDto approvalDto = bookingService.approveBooking(601L, 21L, 6L, false, 201L);

        assertEquals(Booking.CONFIRMED, approvalDto.getStatus());
        assertEquals(Booking.CONFIRMED, booking.getStatus());
        assertEquals(601L, booking.getApprovedBy());
        verify(notificationService).notifyUser(eq(501L), eq("BOOKING_APPROVED"), eq("Booking Request Approved"), contains("Confocal Laser Scanning Microscope"));
    }

    @Test
    public void approveBooking_UnauthorizedDepartment_Throws403() {
        Booking booking = new Booking();
        booking.setBookingId(201L);
        booking.setEquipmentId(101L);
        booking.setUserId(501L);
        booking.setStatus(Booking.PENDING_APPROVAL);

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(equipmentService.getEntity(101L)).thenReturn(testEquipment);

        // Manager is from Dept 99, equipment is Dept 21
        ApiException ex = assertThrows(ApiException.class, () ->
                bookingService.approveBooking(601L, 99L, 6L, false, 201L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    public void approveBooking_AlreadyProcessed_Throws409() {
        Booking booking = new Booking();
        booking.setBookingId(201L);
        booking.setEquipmentId(101L);
        booking.setUserId(501L);
        booking.setStatus(Booking.CONFIRMED); // already confirmed

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));

        ApiException ex = assertThrows(ApiException.class, () ->
                bookingService.approveBooking(601L, 21L, 6L, false, 201L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    public void rejectBooking_Success_ByAuthorizedManager() {
        Booking booking = new Booking();
        booking.setBookingId(201L);
        booking.setEquipmentId(101L);
        booking.setUserId(501L);
        booking.setInstitutionId(6L);
        booking.setDepartmentId(21L);
        booking.setStatus(Booking.PENDING_APPROVAL);
        booking.setStartTime(LocalDateTime.now().plusDays(1));
        booking.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(equipmentService.getEntity(101L)).thenReturn(testEquipment);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(appUserRepository.findById(501L)).thenReturn(Optional.of(studentUser));
        when(appUserRepository.findById(601L)).thenReturn(Optional.of(managerUser));

        String reason = "Laser calibration scheduled during this interval.";
        BookingApprovalDto rejectionDto = bookingService.rejectBooking(601L, 21L, 6L, false, 201L, reason);

        assertEquals(Booking.REJECTED, rejectionDto.getStatus());
        assertEquals(Booking.REJECTED, booking.getStatus());
        assertEquals(reason, booking.getRejectionReason());
        assertEquals(601L, booking.getRejectedBy());
        assertNotNull(booking.getRejectedAt());
        verify(notificationService).notifyUser(eq(501L), eq("BOOKING_REJECTED"), eq("Booking Request Rejected"), contains(reason));
    }

    @Test
    public void rejectBooking_EmptyReason_Throws400() {
        ApiException ex = assertThrows(ApiException.class, () ->
                bookingService.rejectBooking(601L, 21L, 6L, false, 201L, "   "));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Rejection reason is required"));
    }

    @Test
    public void rejectBooking_UnauthorizedDepartment_Throws403() {
        Booking booking = new Booking();
        booking.setBookingId(201L);
        booking.setEquipmentId(101L);
        booking.setUserId(501L);
        booking.setStatus(Booking.PENDING_APPROVAL);

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(equipmentService.getEntity(101L)).thenReturn(testEquipment);

        ApiException ex = assertThrows(ApiException.class, () ->
                bookingService.rejectBooking(601L, 99L, 6L, false, 201L, "Conflict with lab schedule"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }
}
