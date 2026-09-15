package com.labresource.backend.issuereport.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.issuereport.dto.EligibleBookingDto;
import com.labresource.backend.issuereport.dto.IssueReportRequestDto;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import com.labresource.backend.issuereport.repository.EquipmentIssueReportRepository;
import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.role.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EquipmentIssueReportServiceTest {

    @Mock
    private EquipmentIssueReportRepository issueReportRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.labresource.backend.billing.repository.CostRecordRepository costRecordRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private com.labresource.backend.department.repository.DepartmentRepository departmentRepository;

    @Mock
    private com.labresource.backend.laboratory.repository.LaboratoryRepository laboratoryRepository;

    @InjectMocks
    private EquipmentIssueReportService issueReportService;

    private AppUser studentUser;
    private Role studentRole;
    private Equipment eeeEquipment;

    @BeforeEach
    void setUp() {
        studentRole = new Role();
        studentRole.setRoleName("ROLE_STUDENT");

        studentUser = new AppUser();
        studentUser.setUserId(100L);
        studentUser.setDepartmentId(10L); // CSE Department
        studentUser.setInstitutionId(1L);
        studentUser.setRoles(Set.of(studentRole));

        eeeEquipment = new Equipment();
        eeeEquipment.setEquipmentId(500L);
        eeeEquipment.setName("Oscilloscope Pro");
        eeeEquipment.setDepartmentId(20L); // EEE Department
        eeeEquipment.setInstitutionId(1L);
        eeeEquipment.setCategory("Electronics");
        eeeEquipment.setLocation("EEE Lab Room 101");
    }

    private IssueReportRequestDto createValidRequest(Long bookingId, Long equipmentId) {
        IssueReportRequestDto dto = new IssueReportRequestDto();
        dto.setBookingId(bookingId);
        dto.setEquipmentId(equipmentId);
        dto.setIssueType("HARDWARE_FAILURE");
        dto.setDescription("Oscilloscope screen is flickering rapidly");
        dto.setPriority("HIGH");
        dto.setIncidentTimestamp(LocalDateTime.now().minusMinutes(10));
        dto.setDamageAcknowledged(true);
        return dto;
    }

    // TEST 1: Student owns IN_USE booking. Current time inside booking window -> SUCCESS
    @Test
    void test1_StudentOwnsInUseBooking_InsideWindow_Success() {
        Booking booking = new Booking();
        booking.setBookingId(1L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusHours(1));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(equipmentRepository.findById(500L)).thenReturn(Optional.of(eeeEquipment));
        when(issueReportRepository.save(any(EquipmentIssueReport.class))).thenAnswer(i -> {
            EquipmentIssueReport r = i.getArgument(0);
            r.setIssueReportId(10L);
            return r;
        });
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(i -> {
            MaintenanceRequest mr = i.getArgument(0);
            mr.setMaintenanceId(20L);
            return mr;
        });

        IssueReportRequestDto dto = createValidRequest(1L, 500L);
        EquipmentIssueReport result = issueReportService.reportIssue(100L, dto);

        assertNotNull(result);
        assertEquals(500L, result.getEquipmentId());
        assertEquals(1L, result.getBookingId());
        assertEquals("OPEN", result.getStatus());
        assertEquals(20L, result.getDepartmentId()); // Bound to equipment department (EEE)

        verify(notificationService).notifyDepartmentLabManagers(
                eq(20L),
                eq("EQUIPMENT_ISSUE_REPORTED"),
                contains("Oscilloscope Pro"),
                anyString()
        );
    }

    // TEST 2: Student owns COMPLETED booking -> REJECTED
    @Test
    void test2_StudentOwnsCompletedBooking_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(2L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.COMPLETED);
        booking.setStartTime(LocalDateTime.now().minusHours(3));
        booking.setEndTime(LocalDateTime.now().minusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(2L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(2L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("IN_USE"));
    }

    // TEST 3: Student owns CONFIRMED booking before start -> REJECTED
    @Test
    void test3_StudentOwnsConfirmedBookingBeforeStart_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(3L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.CONFIRMED);
        booking.setStartTime(LocalDateTime.now().plusHours(1));
        booking.setEndTime(LocalDateTime.now().plusHours(3));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(3L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(3L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("IN_USE"));
    }

    // TEST 4: Student owns IN_USE booking but current time is before start -> REJECTED
    @Test
    void test4_StudentOwnsInUseBooking_BeforeStart_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(4L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().plusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(2));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(4L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(4L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("active booking time window"));
    }

    // TEST 5: Student owns IN_USE booking but current time is after end -> REJECTED
    @Test
    void test5_StudentOwnsInUseBooking_AfterEnd_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(5L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusHours(3));
        booking.setEndTime(LocalDateTime.now().minusMinutes(5));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(5L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(5L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("active booking time window"));
    }

    // TEST 6: Student owns CANCELLED booking -> REJECTED
    @Test
    void test6_StudentOwnsCancelledBooking_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(6L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.CANCELLED);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(6L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(6L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("IN_USE"));
    }

    // TEST 7: Student owns REJECTED booking -> REJECTED
    @Test
    void test7_StudentOwnsRejectedBooking_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(7L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.REJECTED);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(7L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(7L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("IN_USE"));
    }

    // TEST 8: Student has waitlist entry but no bookingId provided -> REJECTED
    @Test
    void test8_StudentWithoutBookingId_Rejected() {
        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));

        IssueReportRequestDto dto = createValidRequest(null, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("Researchers/Students can only report issues for valid equipment they have booked"));
    }

    // TEST 9: Student tries another user's IN_USE booking -> 403 FORBIDDEN
    @Test
    void test9_StudentTriesAnotherUsersBooking_Forbidden() {
        Booking booking = new Booking();
        booking.setBookingId(9L);
        booking.setUserId(999L); // Other user
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(9L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(9L, 500L);
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("You are not authorized to report an issue for another user's booking"));
    }

    // TEST 10: Student sends mismatched equipmentId with bookingId -> REJECTED
    @Test
    void test10_StudentSendsMismatchedEquipmentId_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(10L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        IssueReportRequestDto dto = createValidRequest(10L, 999L); // Mismatched equipment ID 999
        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Equipment ID does not match"));
    }

    // TEST 11: Student from CSE (dept 10) uses active EEE equipment (dept 20) -> Stored dept EEE, notified EEE manager, not CSE
    @Test
    void test11_CrossDepartmentStudentAndEquipment_RoutingToEquipmentDepartment() {
        Booking booking = new Booking();
        booking.setBookingId(11L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser)); // CSE user
        when(bookingRepository.findById(11L)).thenReturn(Optional.of(booking));
        when(equipmentRepository.findById(500L)).thenReturn(Optional.of(eeeEquipment)); // EEE equipment
        when(issueReportRepository.save(any(EquipmentIssueReport.class))).thenAnswer(i -> {
            EquipmentIssueReport r = i.getArgument(0);
            r.setIssueReportId(110L);
            return r;
        });
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(i -> {
            MaintenanceRequest mr = i.getArgument(0);
            mr.setMaintenanceId(220L);
            return mr;
        });

        IssueReportRequestDto dto = createValidRequest(11L, 500L);
        EquipmentIssueReport result = issueReportService.reportIssue(100L, dto);

        assertNotNull(result);
        assertEquals(20L, result.getDepartmentId()); // EEE Department

        // Verify notification sent ONLY to EEE Lab Managers (departmentId = 20)
        verify(notificationService).notifyDepartmentLabManagers(
                eq(20L),
                eq("EQUIPMENT_ISSUE_REPORTED"),
                contains("Oscilloscope Pro"),
                anyString()
        );
        // Verify CSE Lab Managers (departmentId = 10) are NOT notified
        verify(notificationService, never()).notifyDepartmentLabManagers(
                eq(10L),
                anyString(),
                anyString(),
                anyString()
        );
    }

    // TEST 12: Eligible-bookings endpoint returns only currently active IN_USE bookings
    @Test
    void test12_EligibleBookings_ReturnsOnlyActiveInUse() {
        Booking activeInUse = new Booking();
        activeInUse.setBookingId(101L);
        activeInUse.setEquipmentId(500L);
        activeInUse.setUserId(100L);
        activeInUse.setStatus(Booking.IN_USE);
        activeInUse.setStartTime(LocalDateTime.now().minusMinutes(30));
        activeInUse.setEndTime(LocalDateTime.now().plusHours(1));

        when(bookingRepository.findActiveInUseBookingsForUser(eq(100L), any(LocalDateTime.class)))
                .thenReturn(List.of(activeInUse));
        when(equipmentRepository.findById(500L)).thenReturn(Optional.of(eeeEquipment));

        List<EligibleBookingDto> eligible = issueReportService.getEligibleBookings(100L);

        assertEquals(1, eligible.size());
        assertEquals(101L, eligible.get(0).getBookingId());
        assertEquals(500L, eligible.get(0).getEquipmentId());
        assertEquals("Oscilloscope Pro", eligible.get(0).getEquipmentName());

        verify(bookingRepository).findActiveInUseBookingsForUser(eq(100L), any(LocalDateTime.class));
        verify(bookingRepository, never()).findAll();
    }

    // TEST 13: Missing incidentTimestamp -> REJECTED 400
    @Test
    void test13_MissingIncidentTimestamp_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(13L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(13L)).thenReturn(Optional.of(booking));
        when(equipmentRepository.findById(500L)).thenReturn(Optional.of(eeeEquipment));

        IssueReportRequestDto dto = createValidRequest(13L, 500L);
        dto.setIncidentTimestamp(null); // Explicitly null

        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Incident date and time is required"));
    }

    // TEST 14: Unacknowledged damage -> REJECTED 400
    @Test
    void test14_UnacknowledgedDamage_Rejected() {
        Booking booking = new Booking();
        booking.setBookingId(14L);
        booking.setUserId(100L);
        booking.setEquipmentId(500L);
        booking.setStatus(Booking.IN_USE);
        booking.setStartTime(LocalDateTime.now().minusMinutes(30));
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        when(appUserRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(bookingRepository.findById(14L)).thenReturn(Optional.of(booking));
        when(equipmentRepository.findById(500L)).thenReturn(Optional.of(eeeEquipment));

        IssueReportRequestDto dto = createValidRequest(14L, 500L);
        dto.setDamageAcknowledged(false);

        ApiException ex = assertThrows(ApiException.class, () -> issueReportService.reportIssue(100L, dto));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Damage acknowledgment"));
    }
}
