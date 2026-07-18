package com.pulse.service;

import com.pulse.entity.PasswordResetToken;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.PasswordResetTokenRepository;
import com.pulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class PasswordResetService {

    public static final long EXPIRY_MINUTES = 15;
    private static final long RESEND_SECONDS = 60;

    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwordEncoder;
    private final EmailGateway emails;
    private final SecurityTokenHasher hasher;
    private final String frontendUrl;

    public PasswordResetService(
            UserRepository users,
            PasswordResetTokenRepository tokens,
            PasswordEncoder passwordEncoder,
            EmailGateway emails,
            SecurityTokenHasher hasher,
            @Value("${pulse.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.users = users;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
        this.emails = emails;
        this.hasher = hasher;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Transactional
    public void request(String email) {
        users.findByEmail(normalize(email)).ifPresent(this::issueFor);
    }

    private void issueFor(User user) {
        Instant now = Instant.now();
        PasswordResetToken existing = tokens.findByUserId(user.getId()).orElse(null);
        if (existing != null && existing.getResendAvailableAt().isAfter(now)) return;
        if (existing != null) tokens.delete(existing);

        String rawToken = hasher.randomToken();
        tokens.save(PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(hasher.hash(rawToken))
                .expiresAt(now.plusSeconds(EXPIRY_MINUTES * 60))
                .resendAvailableAt(now.plusSeconds(RESEND_SECONDS))
                .build());
        emails.sendPasswordReset(user.getEmail(), frontendUrl + "/reset-password?token=" + rawToken,
                EXPIRY_MINUTES);
    }

    @Transactional
    public void reset(String rawToken, String newPassword) {
        validatePassword(newPassword);
        PasswordResetToken token = tokens.findByTokenHash(hasher.hash(rawToken))
                .orElseThrow(() -> ApiException.badRequest("Password reset link is invalid or expired"));
        if (!token.getExpiresAt().isAfter(Instant.now())) {
            tokens.delete(token);
            throw ApiException.badRequest("Password reset link is invalid or expired");
        }
        User user = users.findById(token.getUserId())
                .orElseThrow(() -> ApiException.badRequest("Password reset link is invalid or expired"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        users.save(user);
        tokens.deleteByUserId(user.getId());
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 128
                || password.chars().noneMatch(Character::isUpperCase)
                || password.chars().noneMatch(Character::isLowerCase)
                || password.chars().noneMatch(Character::isDigit)) {
            throw ApiException.badRequest(
                    "Password must be 8–128 characters and include uppercase, lowercase, and a number");
        }
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
