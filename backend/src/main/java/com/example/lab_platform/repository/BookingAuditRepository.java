package com.example.lab_platform.repository;

import com.example.lab_platform.entity.BookingAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingAuditRepository extends JpaRepository<BookingAudit, Integer> {

    List<BookingAudit> findByBookingIdOrderByChangedAtAscAuditIdAsc(Integer bookingId);
}