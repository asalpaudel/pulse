package com.pulse.service;

import com.pulse.dto.NotificationDto;
import com.pulse.entity.Notification;
import com.pulse.exception.ApiException;
import com.pulse.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /** Create a notification row and push it over WebSocket to the recipient's personal channel. */
    @Transactional
    public Notification createAndPush(Long userId, String message, String type) {
        Notification n = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .read(false)
                .build();
        n = notificationRepository.save(n);
        messagingTemplate.convertAndSend("/topic/alerts/" + userId, NotificationDto.from(n));
        return n;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDto::from).toList();
    }

    @Transactional
    public NotificationDto markRead(Long userId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw ApiException.forbidden("Not your notification");
        }
        n.setRead(true);
        return NotificationDto.from(notificationRepository.save(n));
    }
}
