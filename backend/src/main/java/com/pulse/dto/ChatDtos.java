package com.pulse.dto;

import com.pulse.entity.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class ChatDtos {

    public record SendMessageRequest(
            @NotNull Long requestId,
            @NotNull Long recipientUserId,
            @NotBlank @Size(max = 2000) String content
    ) {}

    public record ChatMessageDto(
            Long id, Long requestId, Long senderUserId, String senderName,
            Long recipientUserId, String content, boolean readFlag, Instant createdAt
    ) {
        public static ChatMessageDto from(ChatMessage m, String senderName) {
            return new ChatMessageDto(m.getId(), m.getRequestId(), m.getSenderUserId(), senderName,
                    m.getRecipientUserId(), m.getContent(), m.isReadFlag(), m.getCreatedAt());
        }
    }

    /** One row in the conversation list: the counterpart + last-message preview + unread count. */
    public record ConversationDto(
            Long requestId, String bloodGroup,
            Long otherUserId, String otherName,
            String lastMessage, Instant lastAt, long unread
    ) {}
}
