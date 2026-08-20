package com.labplatform.feedback.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;

import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.repository.EquipmentRepository;

import com.labplatform.feedback.dto.EquipmentFeedbackRequest;
import com.labplatform.feedback.dto.EquipmentFeedbackResponse;
import com.labplatform.feedback.model.EquipmentFeedback;
import com.labplatform.feedback.model.FeedbackStatus;
import com.labplatform.feedback.repository.EquipmentFeedbackRepository;

import com.labplatform.notification.service.NotificationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EquipmentFeedbackService {

    private final EquipmentFeedbackRepository feedbackRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public EquipmentFeedbackService(
            EquipmentFeedbackRepository feedbackRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.feedbackRepository = feedbackRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ==========================================
    // SUBMIT FEEDBACK
    // ==========================================

    public EquipmentFeedbackResponse submitFeedback(
            EquipmentFeedbackRequest request) {

        // ==========================================
        // FIND EQUIPMENT
        // ==========================================

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Equipment not found with ID: "
                                        + request.getEquipmentId()
                        )
                );

        // ==========================================
        // GET CURRENT LOGGED-IN USER
        // ==========================================

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );

        // ==========================================
        // CREATE FEEDBACK
        // ==========================================

        EquipmentFeedback feedback =
                new EquipmentFeedback();

        feedback.setEquipment(equipment);

        feedback.setBookingId(
                request.getBookingId()
        );

        // ==========================================
        // SUBMITTER INFORMATION
        // Automatically obtained from logged-in user
        // ==========================================

        feedback.setSubmittedById(
                user.getId()
        );

        feedback.setSubmittedByName(
                user.getFullName()
        );

        feedback.setSubmittedByRole(
                user.getRole().getName()
        );

        // ==========================================
        // FEEDBACK INFORMATION
        // ==========================================

        feedback.setFunctioningStatus(
                request.getFunctioningStatus()
        );

        feedback.setSeverity(
                request.getSeverity()
        );

        feedback.setComments(
                request.getComments()
        );

        // ==========================================
        // INITIAL FEEDBACK STATUS
        // ==========================================

        feedback.setFeedbackStatus(
                FeedbackStatus.NEW
        );

        // ==========================================
        // SAVE FEEDBACK
        // ==========================================

        EquipmentFeedback saved =
                feedbackRepository.save(feedback);

        // ==========================================
        // NOTIFY LAB MANAGERS / MANAGEMENT
        // ==========================================

        String notificationMessage =
                "New equipment feedback received for "
                        + equipment.getEquipmentName()
                        + " | Severity: "
                        + request.getSeverity()
                        + " | Submitted by: "
                        + user.getFullName();

        notificationService.createForManagementRoles(
                "EQUIPMENT_FEEDBACK",
                notificationMessage
        );

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return new EquipmentFeedbackResponse(saved);
    }

    // ==========================================
    // GET ALL FEEDBACK
    // ==========================================

    public List<EquipmentFeedbackResponse> getAllFeedback() {

        return feedbackRepository
                .findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(EquipmentFeedbackResponse::new)
                .collect(Collectors.toList());
    }

    // ==========================================
    // GET NEW FEEDBACK
    // ==========================================

    public List<EquipmentFeedbackResponse> getNewFeedback() {

        return feedbackRepository
                .findByFeedbackStatusOrderBySubmittedAtDesc(
                        FeedbackStatus.NEW
                )
                .stream()
                .map(EquipmentFeedbackResponse::new)
                .collect(Collectors.toList());
    }

    // ==========================================
    // GET FEEDBACK BY EQUIPMENT
    // ==========================================

    public List<EquipmentFeedbackResponse> getFeedbackByEquipment(
            Long equipmentId) {

        return feedbackRepository
                .findByEquipmentIdOrderBySubmittedAtDesc(
                        equipmentId
                )
                .stream()
                .map(EquipmentFeedbackResponse::new)
                .collect(Collectors.toList());
    }

    // ==========================================
    // GET FEEDBACK BY SUBMITTER
    // ==========================================

    public List<EquipmentFeedbackResponse> getFeedbackBySubmitter(
            UUID submittedById) {

        return feedbackRepository
                .findBySubmittedByIdOrderBySubmittedAtDesc(
                        submittedById
                )
                .stream()
                .map(EquipmentFeedbackResponse::new)
                .collect(Collectors.toList());
    }

    // ==========================================
    // UPDATE FEEDBACK STATUS
    // ==========================================

    public EquipmentFeedbackResponse updateStatus(
            Long feedbackId,
            FeedbackStatus status) {

        EquipmentFeedback feedback =
                feedbackRepository
                        .findById(feedbackId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Feedback not found with ID: "
                                                + feedbackId
                                )
                        );

        feedback.setFeedbackStatus(status);

        EquipmentFeedback updated =
                feedbackRepository.save(feedback);

        return new EquipmentFeedbackResponse(updated);
    }
}