package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    long countByUser_UserIdAndIsReadFalse(Integer userId);
}
