package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentUsageCost;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentUsageCostRepository
        extends JpaRepository<EquipmentUsageCost, Integer> {

    Optional<EquipmentUsageCost> findByBooking_BookingId(Integer bookingId);

    List<EquipmentUsageCost> findByEquipment_EquipmentId(Integer equipmentId);

    List<EquipmentUsageCost> findByCostStatus(String costStatus);
}