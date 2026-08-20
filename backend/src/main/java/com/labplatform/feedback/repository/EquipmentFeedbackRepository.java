package com.labplatform.feedback.repository;

import com.labplatform.feedback.model.EquipmentFeedback;
import com.labplatform.feedback.model.FeedbackStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EquipmentFeedbackRepository
        extends JpaRepository<EquipmentFeedback, Long> {

    List<EquipmentFeedback> findBySubmittedByIdOrderBySubmittedAtDesc(
            UUID submittedById
    );

    List<EquipmentFeedback> findByFeedbackStatusOrderBySubmittedAtDesc(
            FeedbackStatus feedbackStatus
    );

    List<EquipmentFeedback> findAllByOrderBySubmittedAtDesc();

    List<EquipmentFeedback> findByEquipmentIdOrderBySubmittedAtDesc(
            Long equipmentId
    );
}