package com.example.lab_platform.service;

import com.example.lab_platform.entity.EquipmentFeedback;

import java.util.List;

public interface EquipmentFeedbackService {

    List<EquipmentFeedback> getAllFeedback();

    List<EquipmentFeedback> getMyFeedback();

    List<EquipmentFeedback> getFeedbackByEquipment(Integer equipmentId);

    // Minimal, non-sensitive list (just IDs, no report details) so any
// booking-capable role can check before submitting a booking.
List<Integer> getUrgentUnresolvedEquipmentIds();

    EquipmentFeedback submitFeedback(EquipmentFeedback feedback);

    // Technician-only: PENDING or REJECTED -> PENDING_APPROVAL
    EquipmentFeedback markAsFixed(Integer id);

    // Manager/Dept Head (Institution Admin as override) only:
    // PENDING_APPROVAL -> RESOLVED or REJECTED
    EquipmentFeedback decideOnFix(Integer id, String decision);

    EquipmentFeedback updateStatus(Integer id, String status);
    
}