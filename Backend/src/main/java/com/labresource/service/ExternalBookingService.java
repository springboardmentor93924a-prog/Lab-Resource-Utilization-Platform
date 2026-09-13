
package com.labresource.service;

import com.labresource.entity.ExternalBooking;
import com.labresource.entity.ExternalBookingStatus;

import java.util.List;

public interface ExternalBookingService {

    ExternalBooking createBooking(ExternalBooking booking);

    List<ExternalBooking> getAllBookings();

    ExternalBooking getBookingById(Long id);

    List<ExternalBooking> getBookingsByEmail(String email);

    List<ExternalBooking> getBookingsByStatus(
            ExternalBookingStatus status
    );

    ExternalBooking approveBooking(
            Long id,
            String remarks
    );

    ExternalBooking rejectBooking(
            Long id,
            String remarks
    );

    ExternalBooking cancelBooking(Long id);
}
