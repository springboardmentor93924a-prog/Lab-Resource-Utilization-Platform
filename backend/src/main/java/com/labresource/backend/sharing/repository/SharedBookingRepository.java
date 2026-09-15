package com.labresource.backend.sharing.repository;

import com.labresource.backend.sharing.entity.SharedBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SharedBookingRepository extends JpaRepository<SharedBooking, Long> {
    Optional<SharedBooking> findByBookingId(Long bookingId);
    List<SharedBooking> findByBookingIdIn(List<Long> bookingIds);
    List<SharedBooking> findByAgreementId(Long agreementId);
    List<SharedBooking> findByAgreementIdIn(List<Long> agreementIds);
}
