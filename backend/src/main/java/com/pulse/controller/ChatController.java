package com.pulse.controller;

import com.pulse.dto.ChatDtos.ChatMessageDto;
import com.pulse.dto.ChatDtos.ConversationDto;
import com.pulse.dto.ChatDtos.SendMessageRequest;
import com.pulse.security.SecurityUtil;
import com.pulse.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Chat between a blood request's requester and a responder. All endpoints operate
 * as the current authenticated user.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /** My conversation list (one row per request+counterpart) with unread counts. */
    @GetMapping("/conversations")
    public List<ConversationDto> conversations() {
        return chatService.conversations(SecurityUtil.currentUserId());
    }

    /** Full thread for a request with a specific counterpart; marks incoming as read. */
    @GetMapping("/requests/{requestId}/with/{otherUserId}")
    public List<ChatMessageDto> thread(@PathVariable Long requestId, @PathVariable Long otherUserId) {
        return chatService.thread(requestId, SecurityUtil.currentUserId(), otherUserId);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> send(@Valid @RequestBody SendMessageRequest req) {
        ChatMessageDto dto = chatService.send(SecurityUtil.currentUserId(),
                req.requestId(), req.recipientUserId(), req.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
