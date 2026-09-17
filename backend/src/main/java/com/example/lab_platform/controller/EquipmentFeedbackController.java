package com.example.lab_platform.controller;

import com.example.lab_platform.entity.EquipmentFeedback;
import com.example.lab_platform.service.EquipmentFeedbackService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-feedback")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class EquipmentFeedbackController {

    private final EquipmentFeedbackService feedbackService;

    public EquipmentFeedbackController(EquipmentFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Any authenticated user can raise feedback — students included,
    // since they're the ones actually using the equipment day-to-day
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentFeedback> submit(@RequestBody EquipmentFeedback feedback) {
        return ResponseEntity.ok(feedbackService.submitFeedback(feedback));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentFeedback>> getMyFeedback() {
        return ResponseEntity.ok(feedbackService.getMyFeedback());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public List<EquipmentFeedback> getAll() {
        return feedbackService.getAllFeedback();
    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<EquipmentFeedback>> getByEquipment(@PathVariable Integer equipmentId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByEquipment(equipmentId));
    }

        // Minimal endpoint for the booking form: just the list of equipment
    // IDs currently blocked by an unresolved urgent issue, no feedback
    // details. Restricted to STUDENT only, matching
    // BookingController.createBooking — the only role that actually
    // creates its own bookings — so the dropdown can warn before
    // submission instead of only failing after.
    @GetMapping("/urgent-equipment-ids")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Integer>> getUrgentEquipmentIds() {
        return ResponseEntity.ok(feedbackService.getUrgentUnresolvedEquipmentIds());
    }

    @PutMapping("/{id}/fix")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentFeedback> markAsFixed(@PathVariable Integer id) {
        return ResponseEntity.ok(feedbackService.markAsFixed(id));
    }

    @PutMapping("/{id}/decide")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentFeedback> decideOnFix(
            @PathVariable Integer id, @RequestParam String decision) {
        return ResponseEntity.ok(feedbackService.decideOnFix(id, decision));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentFeedback> updateStatus(
            @PathVariable Integer id, @RequestParam String status) {
        return ResponseEntity.ok(feedbackService.updateStatus(id, status));
    }
}