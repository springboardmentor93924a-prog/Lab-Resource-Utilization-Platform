package com.infosys.labresource.booking.service;

import com.infosys.labresource.booking.dtos.BookingRequestDTO;
import com.infosys.labresource.booking.dtos.BookingResponseDTO;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO requestDTO);

    List<BookingResponseDTO> getAllBookings();

    BookingResponseDTO getBookingById(Long bookingId);

    BookingResponseDTO updateBooking(Long bookingId,
                                     BookingRequestDTO requestDTO);

    void cancelBooking(Long bookingId);
    BookingResponseDTO approveBooking(Long bookingId);

    BookingResponseDTO rejectBooking(Long bookingId);
}
