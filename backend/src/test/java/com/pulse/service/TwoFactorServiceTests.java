package com.pulse.service;

import com.pulse.entity.Role;
import com.pulse.entity.TwoFactorChallenge;
import com.pulse.entity.User;
import com.pulse.repository.TwoFactorChallengeRepository;
import com.pulse.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class TwoFactorServiceTests {

    private static final String SECRET = "test-security-pepper-that-is-long-enough-12345";

    @Test
    void verifiesEmailCodeBeforeEnablingSuperAdminTwoFactor() {
        User user = User.builder().id(9L).email("owner@pulse.test").passwordHash("hash")
                .role(Role.SUPER_ADMIN).verified(true).twoFactorEnabled(false).build();
        AtomicReference<TwoFactorChallenge> stored = new AtomicReference<>();
        CapturingEmail email = new CapturingEmail();
        TwoFactorService service = new TwoFactorService(userRepository(user), challengeRepository(stored),
                email, new SecurityTokenHasher(SECRET));

        service.requestSetting(user.getId(), "ENABLE");
        assertFalse(user.isTwoFactorEnabled());

        TwoFactorService.SecurityStatus status = service.confirmSetting(user.getId(), "ENABLE", email.code);

        assertTrue(status.enabled());
        assertTrue(user.isTwoFactorEnabled());
        assertNull(stored.get());
    }

    private UserRepository userRepository(User user) {
        return (UserRepository) Proxy.newProxyInstance(UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class}, (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.of(user);
                    case "save" -> args[0];
                    case "toString" -> "TwoFactorUserRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private TwoFactorChallengeRepository challengeRepository(AtomicReference<TwoFactorChallenge> stored) {
        return (TwoFactorChallengeRepository) Proxy.newProxyInstance(
                TwoFactorChallengeRepository.class.getClassLoader(),
                new Class<?>[]{TwoFactorChallengeRepository.class}, (proxy, method, args) -> switch (method.getName()) {
                    case "findByUserIdAndPurpose" -> Optional.ofNullable(stored.get())
                            .filter(item -> item.getPurpose() == args[1]);
                    case "findById" -> Optional.ofNullable(stored.get())
                            .filter(item -> item.getId().equals((UUID) args[0]));
                    case "save" -> { stored.set((TwoFactorChallenge) args[0]); yield args[0]; }
                    case "delete", "deleteByUserIdAndPurpose" -> { stored.set(null); yield null; }
                    case "toString" -> "TwoFactorChallengeRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private static class CapturingEmail implements EmailGateway {
        private String code;
        public void sendTwoFactorCode(String recipient, String code, String action) { this.code = code; }
        public void sendVerificationCode(String recipient, String code) {}
        public void sendNewDeviceCode(String recipient, String code) {}
        public void sendPasswordReset(String recipient, String resetUrl, long expiresInMinutes) {}
        public void sendWelcome(String recipient) {}
    }
}
