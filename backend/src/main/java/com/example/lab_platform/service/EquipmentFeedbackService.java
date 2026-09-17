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

    // Same as above but every unresolved report (NORMAL or URGENT), not
    // just URGENT — matches the actual booking-block rule, used by the
    // Equipment list page to flag a piece of equipment before the
    // student even opens the reservation form.
    List<Integer> getUnresolvedEquipmentIds();

    EquipmentFeedback submitFeedback(EquipmentFeedback feedback);

    // Technician-only: PENDING or REJECTED -> PENDING_APPROVAL
    EquipmentFeedback markAsFixed(Integer id);

    // Manager/Dept Head (Institution Admin as override) only:
    // PENDING_APPROVAL -> RESOLVED or REJECTED
    EquipmentFeedback decideOnFix(Integer id, String decision);

    EquipmentFeedback updateStatus(Integer id, String status);
    
}