package com.pulse.dto;

import com.pulse.entity.Notification;

import java.time.Instant;

public record NotificationDto(Long id, Long userId, String message, String type, boolean read, Instant createdAt) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(n.getId(), n.getUserId(), n.getMessage(), n.getType(), n.isRead(), n.getCreatedAt());
    }
}
