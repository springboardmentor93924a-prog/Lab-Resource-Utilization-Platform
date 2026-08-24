package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);

    List<Notification> findByUser_UserIdAndIsReadOrderByCreatedAtDesc(Integer userId, Boolean isRead);

    boolean existsByUser_UserIdAndNotificationTypeAndReferenceIdAndCreatedAtAfter(
        Integer userId, String notificationType, Integer referenceId, LocalDateTime after);
}