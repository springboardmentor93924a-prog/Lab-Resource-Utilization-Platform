
package com.labresource.service;

import com.labresource.entity.ExternalBooking;
import com.labresource.entity.ExternalBookingStatus;
import com.labresource.repository.ExternalBookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExternalBookingServiceImpl
        implements ExternalBookingService {

    private final ExternalBookingRepository repository;

    public ExternalBookingServiceImpl(
            ExternalBookingRepository repository) {
        this.repository = repository;
    }

    // =========================================================
    // CREATE EXTERNAL BOOKING
    // =========================================================

    @Override
    public ExternalBooking createBooking(
            ExternalBooking booking) {

        // =====================================================
        // BASIC NULL VALIDATION
        // =====================================================

        if (booking == null) {
            throw new RuntimeException(
                    "Booking data is required."
            );
        }

        // =====================================================
        // EXTERNAL USER VALIDATION
        // =====================================================

        if (booking.getExternalName() == null ||
                booking.getExternalName().isBlank()) {

            throw new RuntimeException(
                    "External name is required."
            );
        }

        if (booking.getExternalEmail() == null ||
                booking.getExternalEmail().isBlank()) {

            throw new RuntimeException(
                    "External email is required."
            );
        }

        if (booking.getExternalPhone() == null ||
                booking.getExternalPhone().isBlank()) {

            throw new RuntimeException(
                    "External phone is required."
            );
        }

        // =====================================================
        // EQUIPMENT VALIDATION
        // =====================================================

        if (booking.getEquipment() == null ||
                booking.getEquipment().getId() == null) {

            throw new RuntimeException(
                    "Equipment is required."
            );
        }

        // =====================================================
        // INSTITUTION VALIDATION
        // =====================================================

        if (booking.getInstitution() == null ||
                booking.getInstitution().getId() == null) {

            throw new RuntimeException(
                    "Institution is required."
            );
        }

        // =====================================================
        // PURPOSE VALIDATION
        // =====================================================

        if (booking.getPurpose() == null ||
                booking.getPurpose().isBlank()) {

            throw new RuntimeException(
                    "Purpose is required."
            );
        }

        // =====================================================
        // DATE VALIDATION
        // =====================================================

        if (booking.getBookingDate() == null) {

            throw new RuntimeException(
                    "Booking date is required."
            );
        }

        if (booking.getBookingDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Booking date cannot be in the past."
            );
        }

        // =====================================================
        // TIME VALIDATION
        // =====================================================

        if (booking.getStartTime() == null ||
                booking.getEndTime() == null) {

            throw new RuntimeException(
                    "Start time and end time are required."
            );
        }

        if (!booking.getEndTime()
                .isAfter(booking.getStartTime())) {

            throw new RuntimeException(
                    "End time must be after start time."
            );
        }

        // =====================================================
        // CHECK EQUIPMENT AVAILABILITY
        // =====================================================

        List<ExternalBooking> existing =
                repository.findByEquipmentIdAndBookingDate(
                        booking.getEquipment().getId(),
                        booking.getBookingDate()
                );

        for (ExternalBooking item : existing) {

            // Ignore cancelled and rejected requests
            if (item.getStatus() ==
                        ExternalBookingStatus.CANCELLED ||
                item.getStatus() ==
                        ExternalBookingStatus.REJECTED) {

                continue;
            }

            // =================================================
            // CHECK TIME OVERLAP
            // =================================================

            boolean overlap =
                    booking.getStartTime()
                            .isBefore(item.getEndTime())
                    &&
                    booking.getEndTime()
                            .isAfter(item.getStartTime());

            if (overlap) {

                throw new RuntimeException(
                        "Equipment is already requested " +
                        "for the selected time."
                );
            }
        }

        // =====================================================
        // DEFAULT STATUS
        // =====================================================

        booking.setStatus(
                ExternalBookingStatus.PENDING
        );

        // =====================================================
        // SAVE BOOKING
        // =====================================================

        return repository.save(booking);
    }

    // =========================================================
    // GET ALL BOOKINGS
    // =========================================================

    @Override
    public List<ExternalBooking> getAllBookings() {

        return repository.findAllByOrderByCreatedAtDesc();
    }

    // =========================================================
    // GET BOOKING BY ID
    // =========================================================

    @Override
    public ExternalBooking getBookingById(Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "Booking ID is required."
            );
        }

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "External booking not found."
                        ));
    }

    // =========================================================
    // GET BOOKINGS BY EMAIL
    // =========================================================

    @Override
    public List<ExternalBooking> getBookingsByEmail(
            String email) {

        if (email == null || email.isBlank()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        return repository
                .findByExternalEmailOrderByCreatedAtDesc(
                        email
                );
    }

    // =========================================================
    // GET BOOKINGS BY STATUS
    // =========================================================

    @Override
    public List<ExternalBooking> getBookingsByStatus(
            ExternalBookingStatus status) {

        if (status == null) {

            throw new RuntimeException(
                    "Booking status is required."
            );
        }

        return repository
                .findByStatusOrderByCreatedAtDesc(
                        status
                );
    }

    // =========================================================
    // APPROVE BOOKING
    // =========================================================

    @Override
    public ExternalBooking approveBooking(
            Long id,
            String remarks) {

        ExternalBooking booking =
                getBookingById(id);

        // Only pending bookings can be approved
        if (booking.getStatus() !=
                ExternalBookingStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending bookings can be approved."
            );
        }

        booking.setStatus(
                ExternalBookingStatus.APPROVED
        );

        booking.setAdminRemarks(remarks);

        return repository.save(booking);
    }

    // =========================================================
    // REJECT BOOKING
    // =========================================================

    @Override
    public ExternalBooking rejectBooking(
            Long id,
            String remarks) {

        ExternalBooking booking =
                getBookingById(id);

        // Only pending bookings can be rejected
        if (booking.getStatus() !=
                ExternalBookingStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending bookings can be rejected."
            );
        }

        booking.setStatus(
                ExternalBookingStatus.REJECTED
        );

        booking.setAdminRemarks(remarks);

        return repository.save(booking);
    }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @Override
    public ExternalBooking cancelBooking(Long id) {

        ExternalBooking booking =
                getBookingById(id);

        // Completed bookings cannot be cancelled
        if (booking.getStatus() ==
                ExternalBookingStatus.COMPLETED) {

            throw new RuntimeException(
                    "Completed booking cannot be cancelled."
            );
        }

        // Already cancelled
        if (booking.getStatus() ==
                ExternalBookingStatus.CANCELLED) {

            throw new RuntimeException(
                    "Booking is already cancelled."
            );
        }

        booking.setStatus(
                ExternalBookingStatus.CANCELLED
        );

        return repository.save(booking);
    }
}
