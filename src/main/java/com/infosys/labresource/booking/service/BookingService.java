package com.infosys.labresource.booking.service;

import com.infosys.labresource.booking.dtos.BookingRequestDTO;
import com.infosys.labresource.booking.dtos.BookingResponseDTO;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO reqDto, String requesterEmail);

    List<BookingResponseDTO> getAllBookings();

    BookingResponseDTO getBookingById(Long bookingId);

    BookingResponseDTO updateBooking(Long bookingId, BookingRequestDTO reqDto);

    void cancelBooking(Long bookingId);

    BookingResponseDTO approveBooking(Long bookingId, String approverEmail);

    BookingResponseDTO rejectBooking(Long bookingId);
}
