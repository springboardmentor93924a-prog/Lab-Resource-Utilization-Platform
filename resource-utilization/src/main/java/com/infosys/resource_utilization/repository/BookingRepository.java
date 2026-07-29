package com.infosys.resource_utilization.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.resource_utilization.entity.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

}