package com.labresource.backend.booking.service;

import com.labresource.backend.booking.dto.BookingDto;
import com.labresource.backend.booking.dto.BookingRequestDto;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.service.SharingService;
import com.labresource.backend.waitlist.service.WaitlistService;
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
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private EquipmentService equipmentService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private WaitlistService waitlistService;

    @Mock
    private SharingService sharingService;

    @Mock
    private SharedBookingRepository sharedBookingRepository;

    @Mock
    private BookingAgreementService agreementService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    public void createBooking_Success() {
        Long userId = 1L;
        Long instId = 1L;

        BookingRequestDto request = new BookingRequestDto();
        request.setEquipmentId(10L);
        request.setStartTime(LocalDateTime.now().plusDays(1));
        request.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        request.setPurpose("Test booking");
        request.setAgreementAccepted(true);
        request.setAgreementVersion("2026.1");

        lenient().when(agreementService.isValidVersion("2026.1")).thenReturn(true);

        Equipment eq = new Equipment();
        eq.setEquipmentId(10L);
        eq.setName("Test Equipment");
        eq.setHourlyRate(BigDecimal.valueOf(100));
        eq.setStatus(Equipment.AVAILABLE);
        eq.setCalibrationRequired(false);
        eq.setInstitutionId(instId);
        eq.setDepartmentId(2L);

        when(equipmentService.getEntity(10L)).thenReturn(eq);
        when(equipmentService.hasValidCalibration(10L)).thenReturn(true);
        when(bookingRepository.findOverlapping(eq(10L), any(), any(), any())).thenReturn(Collections.emptyList());
        when(maintenanceRequestRepository.findByEquipmentIdAndStatusNot(eq(10L), anyString())).thenReturn(Collections.emptyList());
        
        Booking saved = new Booking();
        saved.setBookingId(100L);
        saved.setEquipmentId(10L);
        saved.setUserId(userId);
        saved.setStartTime(request.getStartTime());
        saved.setEndTime(request.getEndTime());
        saved.setStatus(Booking.PENDING_APPROVAL);
        saved.setEstimatedCost(BigDecimal.valueOf(200));

        when(bookingRepository.save(any(Booking.class))).thenReturn(saved);

        BookingDto result = bookingService.createBooking(userId, instId, request);

        assertNotNull(result);
        assertEquals(Booking.PENDING_APPROVAL, result.getStatus());
        assertEquals(BigDecimal.valueOf(200), result.getEstimatedCost());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    public void createBooking_TimeOrderError() {
        Long userId = 1L;
        Long instId = 1L;

        BookingRequestDto request = new BookingRequestDto();
        request.setEquipmentId(10L);
        request.setStartTime(LocalDateTime.now().plusDays(1));
        request.setEndTime(LocalDateTime.now().plusDays(1).minusHours(1)); // Invalid end time

        ApiException exception = assertThrows(ApiException.class, () -> {
            bookingService.createBooking(userId, instId, request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("End time must be after start time"));
    }

    private Long eq10() {
        return 10L;
    }
}
