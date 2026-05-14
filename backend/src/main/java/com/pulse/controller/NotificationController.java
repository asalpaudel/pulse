package com.pulse.controller;

import com.pulse.dto.NotificationDto;
import com.pulse.security.SecurityUtil;
import com.pulse.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> list() {
        return notificationService.listForUser(SecurityUtil.currentUserId());
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markRead(@PathVariable Long id) {
        return notificationService.markRead(SecurityUtil.currentUserId(), id);
    }
}
