package com.labplatform;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.*;
import com.labplatform.exception.BookingConflictException;
import com.labplatform.repository.*;
import com.labplatform.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private BookingService bookingService;

    private Equipment equipment;
    private User user;

    @BeforeEach
    void setUp() {
        Institution inst = Institution.builder().id(1L).name("MIT BioLab").build();
        user = User.builder().id(1L).email("researcher@mit.edu").institution(inst).build();
        equipment = Equipment.builder().id(10L).name("Confocal Microscope").hourlyRate(50.0).institution(inst).build();
    }

    @Test
    void testCreateBooking_Success() {
        Dtos.BookingRequest req = new Dtos.BookingRequest(10L, LocalDateTime.now().plusHours(1), LocalDateTime.now().plusHours(3), "Cell imaging");

        when(userRepository.findByEmail("researcher@mit.edu")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(bookingRepository.findConflictingBookings(eq(10L), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking booking = bookingService.createBooking("researcher@mit.edu", req);

        assertNotNull(booking);
        assertEquals(100.0, booking.getTotalCost());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
    }

    @Test
    void testCreateBooking_CollisionThrowsException() {
        Dtos.BookingRequest req = new Dtos.BookingRequest(10L, LocalDateTime.now().plusHours(1), LocalDateTime.now().plusHours(3), "Cell imaging");

        when(userRepository.findByEmail("researcher@mit.edu")).thenReturn(Optional.of(user));
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(bookingRepository.findConflictingBookings(eq(10L), any(), any())).thenReturn(List.of(new Booking()));

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking("researcher@mit.edu", req));
    }
}