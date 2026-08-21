package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentFeedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentFeedbackRepository
        extends JpaRepository<EquipmentFeedback, Integer> {

    List<EquipmentFeedback> findByEquipment_EquipmentId(Integer equipmentId);

    List<EquipmentFeedback> findByStatus(String status);

    // Live check — no cached flag anywhere, always hits the DB fresh.
    // Blocks on PENDING or REVIEWED; only lifts once explicitly RESOLVED.
    // Called on every booking attempt, every approval, and every
    // waitlist auto-allocation, so the block state is always current.
    boolean existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
            Integer equipmentId, String urgency, String status
    );
}