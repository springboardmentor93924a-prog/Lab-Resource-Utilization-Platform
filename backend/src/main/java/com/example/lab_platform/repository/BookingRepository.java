package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
List<Booking> findByBookingStatus(String bookingStatus);
}
