package com.pulse.service;

import com.pulse.entity.BloodGroup;
import com.pulse.entity.BloodRequest;
import com.pulse.exception.ApiException;
import com.pulse.repository.BloodRequestRepository;
import com.pulse.repository.ChatMessageRepository;
import com.pulse.repository.RequestResponseRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ChatServiceAuthorizationTests {
    @Test
    void preventsResponderToResponderMessages() {
        BloodRequest request = BloodRequest.builder().id(14L).requesterUserId(1L)
                .bloodGroup(BloodGroup.O_POS).build();
        BloodRequestRepository requests = proxy(BloodRequestRepository.class, (method, args) ->
                method.equals("findById") ? Optional.of(request) : null);
        RequestResponseRepository responses = proxy(RequestResponseRepository.class, (method, args) ->
                method.equals("existsByBloodRequestIdAndResponderUserId")
                        && (((Long) args[1]).equals(2L) || ((Long) args[1]).equals(3L)));
        ChatMessageRepository messages = proxy(ChatMessageRepository.class, (method, args) -> null);
        ChatService service = new ChatService(messages, requests, responses, null, null, null);

        assertThatThrownBy(() -> service.send(2L, 14L, 3L, "Hello"))
                .isInstanceOf(ApiException.class)
                .hasMessage("Responders can only message the request owner");
    }

    @SuppressWarnings("unchecked")
    private static <T> T proxy(Class<T> type, Handler handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, method, args) -> method.getName().equals("toString")
                        ? "TestRepository" : handler.call(method.getName(), args));
    }

    @FunctionalInterface
    private interface Handler { Object call(String method, Object[] args); }
}
