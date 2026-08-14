package com.labplatform.notification.dto;

import com.labplatform.notification.model.Notification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Integer id;
    private String type;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(Notification n) {
        this.id = n.getId();
        this.type = n.getType();
        this.message = n.getMessage();
        this.isRead = n.getIsRead();
        this.createdAt = n.getCreatedAt();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}