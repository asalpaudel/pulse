package com.pulse.config;

import com.pulse.entity.Role;
import com.pulse.security.JwtService;
import com.pulse.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${pulse.cors.allowed-origins}")
    private String allowedOrigins;
    private final JwtService jwtService;

    public WebSocketConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toArray(String[]::new);
        registry.addEndpoint("/ws")
                .setAllowedOrigins(origins)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) return message;
                if (accessor.getCommand() == StompCommand.CONNECT) authenticate(accessor);
                if (accessor.getCommand() == StompCommand.SEND
                        && value(accessor.getDestination()).startsWith("/topic/")) {
                    throw new AccessDeniedException("Clients cannot publish directly to broker topics");
                }
                if (accessor.getCommand() == StompCommand.SUBSCRIBE) authorizeSubscription(accessor);
                return message;
            }
        });
    }

    private void authenticate(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof Authentication authentication && authentication.isAuthenticated()) return;
        String header = accessor.getFirstNativeHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return;
        try {
            Claims claims = jwtService.parse(header.substring(7));
            Long id = Long.valueOf(claims.getSubject());
            Role role = Role.valueOf(claims.get("role", String.class));
            UserPrincipal principal = new UserPrincipal(id, claims.get("email", String.class), "", role);
            accessor.setUser(UsernamePasswordAuthenticationToken.authenticated(principal, null,
                    java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))));
        } catch (Exception ex) {
            throw new AccessDeniedException("Invalid WebSocket credentials");
        }
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        if (!(accessor.getUser() instanceof Authentication authentication) || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required for WebSocket subscriptions");
        }
        String destination = value(accessor.getDestination());
        if (destination.startsWith("/topic/chat/") || destination.startsWith("/topic/alerts/")) {
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof UserPrincipal user)
                    || !destination.endsWith("/" + user.getId())) {
                throw new AccessDeniedException("Personal topics may only be accessed by their owner");
            }
        }
    }

    private String value(String value) {
        return value == null ? "" : value;
    }
}
