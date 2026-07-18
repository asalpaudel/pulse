package com.pulse.repository;

import com.pulse.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** All messages that touch this user, newest first — used to assemble the conversation list. */
    List<ChatMessage> findBySenderUserIdOrRecipientUserIdOrderByCreatedAtDesc(Long sender, Long recipient);

    /** The full thread for one request between two users, oldest first. */
    @Query("""
            select m from ChatMessage m
            where m.requestId = :requestId
              and ((m.senderUserId = :a and m.recipientUserId = :b)
                or (m.senderUserId = :b and m.recipientUserId = :a))
            order by m.createdAt asc
            """)
    List<ChatMessage> findThread(@Param("requestId") Long requestId,
                                 @Param("a") Long a, @Param("b") Long b);

    /** Unread messages sent TO this user in a given request-thread (to mark them read). */
    List<ChatMessage> findByRequestIdAndSenderUserIdAndRecipientUserIdAndReadFlagFalse(
            Long requestId, Long senderUserId, Long recipientUserId);

    long countByRecipientUserIdAndReadFlagFalse(Long recipientUserId);
}
