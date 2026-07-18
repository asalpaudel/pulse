package com.pulse.service;

import com.pulse.dto.AuthDtos.AuthResponse;
import com.pulse.entity.EmailVerificationToken;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.EmailVerificationTokenRepository;
import com.pulse.repository.UserRepository;
import com.pulse.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class EmailVerificationService {

    public static final long EXPIRY_SECONDS = 600;
    private static final long RESEND_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository users;
    private final EmailVerificationTokenRepository tokens;
    private final EmailGateway emails;
    private final JwtService jwtService;
    private final byte[] pepper;
    private final SecureRandom random = new SecureRandom();

    public EmailVerificationService(
            UserRepository users,
            EmailVerificationTokenRepository tokens,
            EmailGateway emails,
            JwtService jwtService,
            @Value("${pulse.otp.pepper:${pulse.jwt.secret}}") String pepper
    ) {
        if (pepper == null || pepper.length() < 32) {
            throw new IllegalArgumentException("OTP pepper must contain at least 32 characters");
        }
        this.users = users;
        this.tokens = tokens;
        this.emails = emails;
        this.jwtService = jwtService;
        this.pepper = pepper.getBytes(StandardCharsets.UTF_8);
    }

    @Transactional
    public void issueFor(User user) {
        Instant now = Instant.now();
        EmailVerificationToken token = tokens.findByUserId(user.getId()).orElseGet(EmailVerificationToken::new);
        if (token.getResendAvailableAt() != null && token.getResendAvailableAt().isAfter(now)) {
            long wait = Math.max(1, Duration.between(now, token.getResendAvailableAt()).toSeconds());
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Wait " + wait + " seconds before requesting another code");
        }

        String code = "%06d".formatted(random.nextInt(1_000_000));
        token.setUserId(user.getId());
        token.setCodeHash(hash(code));
        token.setAttempts(0);
        token.setExpiresAt(now.plusSeconds(EXPIRY_SECONDS));
        token.setResendAvailableAt(now.plusSeconds(RESEND_SECONDS));
        tokens.save(token);
        emails.sendVerificationCode(user.getEmail(), code);
    }

    @Transactional
    public void resend(String email) {
        users.findByEmail(normalize(email)).filter(user -> !user.isVerified()).ifPresent(this::issueFor);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse verify(String email, String code) {
        User user = users.findByEmail(normalize(email))
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired verification code"));
        if (user.isVerified()) {
            return authenticated(user);
        }

        EmailVerificationToken token = tokens.findByUserId(user.getId())
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired verification code"));
        Instant now = Instant.now();
        if (!token.getExpiresAt().isAfter(now)) {
            tokens.delete(token);
            throw ApiException.badRequest("Verification code expired; request a new code");
        }
        if (token.getAttempts() >= MAX_ATTEMPTS) {
            tokens.delete(token);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts; request a new code");
        }
        if (!MessageDigest.isEqual(token.getCodeHash().getBytes(StandardCharsets.US_ASCII),
                hash(code).getBytes(StandardCharsets.US_ASCII))) {
            token.setAttempts(token.getAttempts() + 1);
            tokens.save(token);
            throw ApiException.unauthorized("Invalid or expired verification code");
        }

        user.setVerified(true);
        users.save(user);
        tokens.delete(token);
        return authenticated(user);
    }

    private AuthResponse authenticated(User user) {
        String jwt = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(jwt, user.getId(), user.getRole());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String hash(String code) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(pepper, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(code.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash verification code", ex);
        }
    }
}
