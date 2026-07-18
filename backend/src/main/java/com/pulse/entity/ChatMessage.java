package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A direct message exchanged over a specific blood request between the requester
 * (hospital) and a responder (donor / blood bank). A "conversation" is the set of
 * messages sharing the same {@code requestId} between the same two users.
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_request", columnList = "request_id"),
        @Index(name = "idx_chat_recipient", columnList = "recipient_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "sender_user_id", nullable = false)
    private Long senderUserId;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "read_flag", nullable = false)
    private boolean readFlag;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
