package com.pulse.service;

import com.pulse.entity.Role;
import com.pulse.entity.TrustedDevice;
import com.pulse.entity.TwoFactorChallenge;
import com.pulse.entity.User;
import com.pulse.repository.TrustedDeviceRepository;
import com.pulse.repository.TwoFactorChallengeRepository;
import com.pulse.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class TrustedDeviceServiceTests {

    @Test
    void verifiesCodeAndCreatesAHashedTrustedDevice() {
        User user = User.builder().id(9L).email("donor@pulse.test").role(Role.DONOR).verified(true).build();
        SecurityTokenHasher hasher = new SecurityTokenHasher("a-secure-test-pepper-that-is-long-enough");
        CapturingEmail emails = new CapturingEmail();
        AtomicReference<TwoFactorChallenge> storedChallenge = new AtomicReference<>();
        AtomicReference<TrustedDevice> storedDevice = new AtomicReference<>();
        UserRepository users = proxy(UserRepository.class, (method, args) -> switch (method) {
            case "findById" -> Optional.of(user);
            default -> defaultValue(method);
        });
        TrustedDeviceRepository devices = proxy(TrustedDeviceRepository.class, (method, args) -> {
            if (method.equals("save")) {
                storedDevice.set((TrustedDevice) args[0]);
                return args[0];
            }
            return defaultValue(method);
        });
        TwoFactorChallengeRepository challenges = proxy(TwoFactorChallengeRepository.class, (method, args) -> {
            if (method.equals("findByUserIdAndPurpose")) return Optional.empty();
            if (method.equals("findById")) return Optional.ofNullable(storedChallenge.get());
            if (method.equals("save")) {
                storedChallenge.set((TwoFactorChallenge) args[0]);
                return args[0];
            }
            return defaultValue(method);
        });

        TrustedDeviceService service = new TrustedDeviceService(users, devices, challenges, hasher, emails);
        var challenge = service.issue(user);
        var verified = service.verify(challenge.challengeId(), emails.code, "Pulse Test Browser");

        assertThat(verified.user().getId()).isEqualTo(9L);
        assertThat(storedDevice.get().getTokenHash()).isNotEqualTo(verified.token());
        assertThat(hasher.matches(verified.token(), storedDevice.get().getTokenHash())).isTrue();
        assertThat(storedChallenge.get()).isNotNull();
    }

    @SuppressWarnings("unchecked")
    private static <T> T proxy(Class<T> type, Handler handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, method, args) -> handler.call(method.getName(), args));
    }

    private static Object defaultValue(String method) {
        if (method.equals("toString")) return "TestRepository";
        if (method.startsWith("find")) return Optional.empty();
        return null;
    }

    @FunctionalInterface
    private interface Handler { Object call(String method, Object[] args); }

    private static final class CapturingEmail implements EmailGateway {
        String code;
        public void sendNewDeviceCode(String recipient, String code) { this.code = code; }
        public void sendVerificationCode(String recipient, String code) {}
        public void sendTwoFactorCode(String recipient, String code, String action) {}
        public void sendPasswordReset(String recipient, String resetUrl, long expiresInMinutes) {}
        public void sendWelcome(String recipient) {}
    }
}
