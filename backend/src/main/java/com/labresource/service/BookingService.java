package com.labresource.service;

import com.labresource.dto.booking.BookingRequest;
import com.labresource.dto.booking.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(
            BookingRequest request
    );

    List<BookingResponse> getAllBookings();

    BookingResponse getBookingById(
            String bookingId
    );

    List<BookingResponse> getBookingsByUser(
            String userId
    );

    List<BookingResponse> getBookingsByEquipment(
            String equipmentId
    );

    List<BookingResponse> getBookingsByStatus(
            String bookingStatus
    );

    List<BookingResponse> getBookingsByApprovalStatus(
            String approvalStatus
    );

    BookingResponse approveBooking(
            String bookingId
    );

    BookingResponse rejectBooking(
            String bookingId
    );

    BookingResponse cancelBooking(
            String bookingId
    );

    BookingResponse updateBooking(
            String bookingId,
            BookingRequest request
    );

    void deleteBooking(
            String bookingId
    );
}

//User
//   │
//   ▼
//BookingController
//   │
//   ▼
//BookingService
//   │
//   ▼
//BookingRepository
//   │
//   ▼
//Database





//implUser
//   │
//   ▼
//Find Equipment
//   │
//   ▼
//Find User
//   │
//   ▼
//Equipment AVAILABLE?
//   │
//   ├── No → Exception
//   │
//   ▼
//Time Conflict?
//   │
//   ├── Yes → Exception
//   │
//   ▼
//Save Booking
//   │
//   ▼
//Return Response