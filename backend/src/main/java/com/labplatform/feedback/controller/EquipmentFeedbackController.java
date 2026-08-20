package com.labplatform.feedback.controller;

import com.labplatform.feedback.dto.EquipmentFeedbackRequest;
import com.labplatform.feedback.dto.EquipmentFeedbackResponse;
import com.labplatform.feedback.model.FeedbackStatus;
import com.labplatform.feedback.service.EquipmentFeedbackService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin
public class EquipmentFeedbackController {

    private final EquipmentFeedbackService feedbackService;

    public EquipmentFeedbackController(
            EquipmentFeedbackService feedbackService) {

        this.feedbackService = feedbackService;
    }

    // ==========================================
    // SUBMIT FEEDBACK
    // ==========================================

    @PostMapping
    public ResponseEntity<EquipmentFeedbackResponse> submitFeedback(
            @Valid @RequestBody EquipmentFeedbackRequest request) {

        EquipmentFeedbackResponse response =
                feedbackService.submitFeedback(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // GET ALL FEEDBACK
    // ==========================================

    @GetMapping
    public ResponseEntity<List<EquipmentFeedbackResponse>>
    getAllFeedback() {

        return ResponseEntity.ok(
                feedbackService.getAllFeedback()
        );
    }

    // ==========================================
    // GET NEW FEEDBACK
    // ==========================================

    @GetMapping("/new")
    public ResponseEntity<List<EquipmentFeedbackResponse>>
    getNewFeedback() {

        return ResponseEntity.ok(
                feedbackService.getNewFeedback()
        );
    }

    // ==========================================
    // GET FEEDBACK BY EQUIPMENT
    // ==========================================

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<EquipmentFeedbackResponse>>
    getFeedbackByEquipment(
            @PathVariable Long equipmentId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByEquipment(
                        equipmentId
                )
        );
    }

    // ==========================================
    // GET FEEDBACK BY SUBMITTER
    // ==========================================

    @GetMapping("/submitter/{submittedById}")
    public ResponseEntity<List<EquipmentFeedbackResponse>>
    getFeedbackBySubmitter(
            @PathVariable UUID submittedById) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackBySubmitter(
                        submittedById
                )
        );
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    @PutMapping("/{id}/status")
    public ResponseEntity<EquipmentFeedbackResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam FeedbackStatus status) {

        return ResponseEntity.ok(
                feedbackService.updateStatus(
                        id,
                        status
                )
        );
    }
}