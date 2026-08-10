package com.infosys.labresource.booking.Repository;

import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingWaitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingWaitlistRepository extends JpaRepository<BookingWaitlist,Long> {

    boolean existsByBooking(Booking booking);

    Optional<BookingWaitlist> findByBooking(Booking booking);
}
