package com.infosys.labresource.notification.Repository;

import com.infosys.labresource.notification.entity.Notification;
import com.infosys.labresource.user.entites.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(UserEntity recipient);

    long countByRecipientAndIsReadFalse(UserEntity recipient);
}
