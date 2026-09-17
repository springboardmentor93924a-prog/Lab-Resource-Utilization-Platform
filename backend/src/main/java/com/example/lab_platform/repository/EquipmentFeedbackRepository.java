package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentFeedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentFeedbackRepository
        extends JpaRepository<EquipmentFeedback, Integer> {

    List<EquipmentFeedback> findByEquipment_EquipmentId(Integer equipmentId);

    List<EquipmentFeedback> findByReportedBy_UserIdOrderByCreatedDateDesc(Integer userId);

    List<EquipmentFeedback> findAllByOrderByCreatedDateDesc();

    List<EquipmentFeedback> findByStatus(String status);

    // Live check — no cached flag anywhere, always hits the DB fresh.
    // Blocks on anything that isn't RESOLVED (PENDING, PENDING_APPROVAL,
    // REJECTED all still block); only lifts once a manager/dept-head
    // explicitly approves the fix. Called on every booking attempt, every
    // approval, and every waitlist auto-allocation.
    boolean existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
            Integer equipmentId, String urgency, String status
    );

    // Same live check, but not filtered to URGENT — any unresolved
    // report (NORMAL or URGENT) blocks booking. This is the one
    // actually used to gate bookings/approvals/waitlist now; the
    // urgency-filtered version above is kept for anywhere that still
    // needs to distinguish severity specifically.
    boolean existsByEquipment_EquipmentIdAndStatusNot(
            Integer equipmentId, String status
    );

    // Same live check as above, but as a bulk list of equipment IDs —
    // used to flag "unbookable" equipment in the booking dropdown before
    // the student even attempts to submit, instead of only failing after.
    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT f.equipment.equipmentId FROM EquipmentFeedback f " +
        "WHERE f.urgency = :urgency AND f.status <> :status"
    )
    java.util.List<Integer> findEquipmentIdsWithUnresolvedUrgentIssue(
            @org.springframework.data.repository.query.Param("urgency") String urgency,
            @org.springframework.data.repository.query.Param("status") String status
    );

    // Bulk equivalent of existsByEquipment_EquipmentIdAndStatusNot —
    // any unresolved report of either urgency, not just URGENT. This is
    // what the frontend now calls to flag equipment before the student
    // even opens the reservation form.
    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT f.equipment.equipmentId FROM EquipmentFeedback f " +
        "WHERE f.status <> :status"
    )
    java.util.List<Integer> findEquipmentIdsWithUnresolvedIssue(
            @org.springframework.data.repository.query.Param("status") String status
    );

    // Used to stop a second feedback submission against the same
    // booking once one has already gone in (the inline "Submit Feedback"
    // action in My Bookings should disappear after first use).
    boolean existsByBooking_BookingId(Integer bookingId);
}