package com.pulse.service;

import com.pulse.entity.PasswordResetToken;
import com.pulse.entity.Role;
import com.pulse.entity.User;
import com.pulse.repository.PasswordResetTokenRepository;
import com.pulse.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class PasswordResetServiceTests {

    private static final String SECRET = "test-security-pepper-that-is-long-enough-12345";

    @Test
    void issuesHashedSingleUseTokenAndChangesPassword() {
        User user = User.builder().id(4L).email("owner@pulse.test").passwordHash("old")
                .role(Role.SUPER_ADMIN).verified(true).build();
        AtomicReference<PasswordResetToken> stored = new AtomicReference<>();
        CapturingEmail email = new CapturingEmail();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        PasswordResetService service = new PasswordResetService(userRepository(user), tokenRepository(stored),
                encoder, email, new SecurityTokenHasher(SECRET), "https://pulse.test");

        service.request(user.getEmail());
        String rawToken = email.resetUrl.substring(email.resetUrl.indexOf("token=") + 6);

        assertNotEquals(rawToken, stored.get().getTokenHash());
        assertEquals(64, stored.get().getTokenHash().length());

        service.reset(rawToken, "SecurePass9");

        assertTrue(encoder.matches("SecurePass9", user.getPasswordHash()));
        assertNull(stored.get());
    }

    private UserRepository userRepository(User user) {
        return (UserRepository) Proxy.newProxyInstance(UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class}, (proxy, method, args) -> switch (method.getName()) {
                    case "findByEmail", "findById" -> Optional.of(user);
                    case "save" -> args[0];
                    case "toString" -> "PasswordResetUserRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private PasswordResetTokenRepository tokenRepository(AtomicReference<PasswordResetToken> stored) {
        return (PasswordResetTokenRepository) Proxy.newProxyInstance(
                PasswordResetTokenRepository.class.getClassLoader(),
                new Class<?>[]{PasswordResetTokenRepository.class}, (proxy, method, args) -> switch (method.getName()) {
                    case "findByUserId" -> Optional.ofNullable(stored.get());
                    case "findByTokenHash" -> Optional.ofNullable(stored.get())
                            .filter(token -> token.getTokenHash().equals(args[0]));
                    case "save" -> { stored.set((PasswordResetToken) args[0]); yield args[0]; }
                    case "delete", "deleteByUserId" -> { stored.set(null); yield null; }
                    case "toString" -> "PasswordResetTokenRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private static class CapturingEmail implements EmailGateway {
        private String resetUrl;
        public void sendPasswordReset(String recipient, String resetUrl, long expiresInMinutes) { this.resetUrl = resetUrl; }
        public void sendVerificationCode(String recipient, String code) {}
        public void sendNewDeviceCode(String recipient, String code) {}
        public void sendTwoFactorCode(String recipient, String code, String action) {}
        public void sendWelcome(String recipient) {}
    }
}
