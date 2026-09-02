package com.labresource.repository;

import com.labresource.entity.Notification;
import com.labresource.entity.User;
import com.labresource.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndStatusOrderByCreatedAtDesc(
            User user, NotificationStatus status);
    long countByUserAndStatus(User user, NotificationStatus status);
}
