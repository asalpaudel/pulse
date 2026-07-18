package com.pulse.service;

import com.pulse.dto.ChatDtos.ChatMessageDto;
import com.pulse.dto.ChatDtos.ConversationDto;
import com.pulse.entity.BloodRequest;
import com.pulse.entity.ChatMessage;
import com.pulse.exception.ApiException;
import com.pulse.repository.BloodRequestRepository;
import com.pulse.repository.ChatMessageRepository;
import com.pulse.repository.RequestResponseRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Direct messaging between a blood-request's requester (hospital) and a responder
 * (donor / blood bank). Messages are pushed live over STOMP to each participant's
 * personal channel {@code /topic/chat/{userId}}.
 */
@Service
public class ChatService {

    private final ChatMessageRepository chatRepository;
    private final BloodRequestRepository requestRepository;
    private final RequestResponseRepository responseRepository;
    private final NameResolver nameResolver;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public ChatService(ChatMessageRepository chatRepository,
                       BloodRequestRepository requestRepository,
                       RequestResponseRepository responseRepository,
                       NameResolver nameResolver,
                       SimpMessagingTemplate messagingTemplate,
                       NotificationService notificationService) {
        this.chatRepository = chatRepository;
        this.requestRepository = requestRepository;
        this.responseRepository = responseRepository;
        this.nameResolver = nameResolver;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    private BloodRequest requireRequest(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Blood request not found"));
    }

    /** A user may chat on a request if they own it or have responded to it. */
    private boolean isParticipant(BloodRequest r, Long userId) {
        return r.getRequesterUserId().equals(userId)
                || responseRepository.existsByBloodRequestIdAndResponderUserId(r.getId(), userId);
    }

    @Transactional
    public ChatMessageDto send(Long senderUserId, Long requestId, Long recipientUserId, String content) {
        if (content == null || content.isBlank()) {
            throw ApiException.badRequest("Message cannot be empty");
        }
        BloodRequest r = requireRequest(requestId);
        requireConversationPair(r, senderUserId, recipientUserId);
        ChatMessage saved = chatRepository.save(ChatMessage.builder()
                .requestId(requestId)
                .senderUserId(senderUserId)
                .recipientUserId(recipientUserId)
                .content(content.trim())
                .readFlag(false)
                .build());

        ChatMessageDto dto = ChatMessageDto.from(saved, nameResolver.nameFor(senderUserId));
        // Live-push to both ends so open threads update instantly.
        messagingTemplate.convertAndSend("/topic/chat/" + recipientUserId, dto);
        messagingTemplate.convertAndSend("/topic/chat/" + senderUserId, dto);
        // Bell notification for the recipient.
        notificationService.createAndPush(recipientUserId,
                dto.senderName() + ": " + dto.content(), "CHAT_MESSAGE");
        return dto;
    }

    @Transactional
    public List<ChatMessageDto> thread(Long requestId, Long meUserId, Long otherUserId) {
        BloodRequest r = requireRequest(requestId);
        requireConversationPair(r, meUserId, otherUserId);
        // Mark messages addressed to me from the other party as read.
        var unread = chatRepository
                .findByRequestIdAndSenderUserIdAndRecipientUserIdAndReadFlagFalse(requestId, otherUserId, meUserId);
        unread.forEach(m -> m.setReadFlag(true));
        chatRepository.saveAll(unread);

        return chatRepository.findThread(requestId, meUserId, otherUserId).stream()
                .map(m -> ChatMessageDto.from(m, nameResolver.nameFor(m.getSenderUserId())))
                .toList();
    }

    private void requireConversationPair(BloodRequest request, Long first, Long second) {
        if (first == null || second == null || first.equals(second)) {
            throw ApiException.badRequest("A conversation requires two different participants");
        }
        if (!isParticipant(request, first)) {
            throw ApiException.forbidden("You are not part of this request's conversation");
        }
        if (!isParticipant(request, second)) {
            throw ApiException.badRequest("Recipient is not part of this request");
        }
        Long requester = request.getRequesterUserId();
        if (!requester.equals(first) && !requester.equals(second)) {
            throw ApiException.forbidden("Responders can only message the request owner");
        }
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> conversations(Long meUserId) {
        List<ChatMessage> all = chatRepository
                .findBySenderUserIdOrRecipientUserIdOrderByCreatedAtDesc(meUserId, meUserId);
        // Group by (requestId, otherUserId); keep newest as the preview, count unread-to-me.
        Map<String, ConversationAccumulator> byConvo = new LinkedHashMap<>();
        for (ChatMessage m : all) {
            Long other = m.getSenderUserId().equals(meUserId) ? m.getRecipientUserId() : m.getSenderUserId();
            String key = m.getRequestId() + ":" + other;
            ConversationAccumulator acc = byConvo.computeIfAbsent(key,
                    k -> new ConversationAccumulator(m.getRequestId(), other, m));
            if (m.getRecipientUserId().equals(meUserId) && !m.isReadFlag()) acc.unread++;
        }
        var names = nameResolver.namesFor(
                byConvo.values().stream().map(a -> a.otherUserId).toList());
        List<ConversationDto> out = new ArrayList<>();
        for (ConversationAccumulator acc : byConvo.values()) {
            String bloodGroup = requestRepository.findById(acc.requestId)
                    .map(r -> r.getBloodGroup().name()).orElse(null);
            out.add(new ConversationDto(acc.requestId, bloodGroup, acc.otherUserId,
                    names.get(acc.otherUserId),
                    acc.newest.getContent(), acc.newest.getCreatedAt(), acc.unread));
        }
        return out;
    }

    private static final class ConversationAccumulator {
        final Long requestId;
        final Long otherUserId;
        final ChatMessage newest; // list is desc, so the first seen is newest
        long unread = 0;
        ConversationAccumulator(Long requestId, Long otherUserId, ChatMessage newest) {
            this.requestId = requestId;
            this.otherUserId = otherUserId;
            this.newest = newest;
        }
    }
}
