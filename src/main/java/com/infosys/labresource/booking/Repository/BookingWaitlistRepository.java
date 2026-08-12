package com.infosys.labresource.booking.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingWaitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingWaitlistRepository extends JpaRepository<BookingWaitlist,Long> {

    boolean existsByBooking(Booking booking);


    Optional<BookingWaitlist> findByBooking(Booking booking);

    List<BookingWaitlist> findByActiveTrueOrderByAddedAtAsc();

    List<BookingWaitlist> findByBooking_EquipmentAndActiveTrueOrderByAddedAtAsc(
            Equipment equipment);
}
