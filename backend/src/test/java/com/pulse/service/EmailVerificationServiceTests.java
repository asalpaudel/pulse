package com.pulse.service;

import com.pulse.dto.AuthDtos.AuthResponse;
import com.pulse.entity.EmailVerificationToken;
import com.pulse.entity.Role;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.EmailVerificationTokenRepository;
import com.pulse.repository.UserRepository;
import com.pulse.security.JwtService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class EmailVerificationServiceTests {

    private static final String SECRET = "test-verification-pepper-that-is-long-enough-123";

    @Test
    void issuesHashedCodesAndVerifiesTheAccount() {
        User user = user();
        AtomicReference<EmailVerificationToken> token = new AtomicReference<>();
        CapturingEmailGateway email = new CapturingEmailGateway();
        EmailVerificationService service = service(user, token, email);

        service.issueFor(user);
        String storedHash = token.get().getCodeHash();
        AuthResponse response = service.verify(user.getEmail(), email.code);

        assertNotEquals(email.code, storedHash);
        assertEquals(64, storedHash.length());
        assertNull(token.get());
        assertTrue(user.isVerified());
        assertNotNull(response.token());
    }

    @Test
    void countsInvalidAttempts() {
        User user = user();
        AtomicReference<EmailVerificationToken> token = new AtomicReference<>();
        CapturingEmailGateway email = new CapturingEmailGateway();
        EmailVerificationService service = service(user, token, email);
        service.issueFor(user);
        String wrongCode = email.code.equals("000000") ? "000001" : "000000";

        ApiException error = assertThrows(ApiException.class,
                () -> service.verify(user.getEmail(), wrongCode));

        assertEquals(401, error.getStatus().value());
        assertEquals(1, token.get().getAttempts());
        assertFalse(user.isVerified());
    }

    private EmailVerificationService service(
            User user,
            AtomicReference<EmailVerificationToken> token,
            CapturingEmailGateway email
    ) {
        return new EmailVerificationService(userRepository(user), tokenRepository(token), email,
                new JwtService(SECRET, 60_000), SECRET);
    }

    private User user() {
        return User.builder().id(7L).email("donor@pulse.test").passwordHash("hash")
                .role(Role.DONOR).verified(false).build();
    }

    private UserRepository userRepository(User user) {
        return (UserRepository) Proxy.newProxyInstance(UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class}, (proxy, method, arguments) -> switch (method.getName()) {
                    case "findByEmail", "findById" -> Optional.of(user);
                    case "save" -> arguments[0];
                    case "toString" -> "InMemoryUserRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private EmailVerificationTokenRepository tokenRepository(AtomicReference<EmailVerificationToken> token) {
        return (EmailVerificationTokenRepository) Proxy.newProxyInstance(
                EmailVerificationTokenRepository.class.getClassLoader(),
                new Class<?>[]{EmailVerificationTokenRepository.class},
                (proxy, method, arguments) -> switch (method.getName()) {
                    case "findByUserId" -> Optional.ofNullable(token.get());
                    case "save" -> {
                        EmailVerificationToken saved = (EmailVerificationToken) arguments[0];
                        token.set(saved);
                        yield saved;
                    }
                    case "delete", "deleteByUserId" -> {
                        token.set(null);
                        yield null;
                    }
                    case "toString" -> "InMemoryVerificationTokenRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private static class CapturingEmailGateway implements EmailGateway {
        private String code;

        @Override
        public void sendVerificationCode(String recipient, String code) {
            this.code = code;
        }

        @Override
        public void sendNewDeviceCode(String recipient, String code) {
        }

        @Override
        public void sendWelcome(String recipient) {
        }
    }
}
