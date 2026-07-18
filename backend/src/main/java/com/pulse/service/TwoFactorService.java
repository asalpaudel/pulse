package com.pulse.service;

import com.pulse.entity.Role;
import com.pulse.entity.TwoFactorChallenge;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.TwoFactorChallengeRepository;
import com.pulse.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class TwoFactorService {

    public static final long EXPIRY_SECONDS = 600;
    private static final long RESEND_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;

    public record ChallengeInfo(UUID challengeId, long expiresInSeconds) {}
    public record SecurityStatus(boolean enabled, String email) {}

    private final UserRepository users;
    private final TwoFactorChallengeRepository challenges;
    private final EmailGateway emails;
    private final SecurityTokenHasher hasher;

    public TwoFactorService(UserRepository users, TwoFactorChallengeRepository challenges,
                            EmailGateway emails, SecurityTokenHasher hasher) {
        this.users = users;
        this.challenges = challenges;
        this.emails = emails;
        this.hasher = hasher;
    }

    @Transactional(readOnly = true)
    public SecurityStatus status(Long userId) {
        User user = superAdmin(userId);
        return new SecurityStatus(user.isTwoFactorEnabled(), user.getEmail());
    }

    @Transactional
    public ChallengeInfo issueLogin(User user) {
        if (user.getRole() != Role.SUPER_ADMIN || !user.isTwoFactorEnabled()) {
            throw ApiException.badRequest("Two-factor authentication is not enabled");
        }
        return issue(user, TwoFactorChallenge.Purpose.LOGIN);
    }

    @Transactional
    public ChallengeInfo requestSetting(Long userId, String action) {
        User user = superAdmin(userId);
        TwoFactorChallenge.Purpose purpose = settingPurpose(action);
        if (purpose == TwoFactorChallenge.Purpose.ENABLE && user.isTwoFactorEnabled()) {
            throw ApiException.conflict("Two-factor authentication is already enabled");
        }
        if (purpose == TwoFactorChallenge.Purpose.DISABLE && !user.isTwoFactorEnabled()) {
            throw ApiException.conflict("Two-factor authentication is already disabled");
        }
        return issue(user, purpose);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public SecurityStatus confirmSetting(Long userId, String action, String code) {
        User user = superAdmin(userId);
        TwoFactorChallenge.Purpose purpose = settingPurpose(action);
        TwoFactorChallenge challenge = challenges.findByUserIdAndPurpose(userId, purpose)
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired security code"));
        verify(challenge, code);
        user.setTwoFactorEnabled(purpose == TwoFactorChallenge.Purpose.ENABLE);
        users.save(user);
        return new SecurityStatus(user.isTwoFactorEnabled(), user.getEmail());
    }

    @Transactional(noRollbackFor = ApiException.class)
    public User verifyLogin(UUID challengeId, String code) {
        TwoFactorChallenge challenge = challenges.findById(challengeId)
                .filter(item -> item.getPurpose() == TwoFactorChallenge.Purpose.LOGIN)
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired security code"));
        verify(challenge, code);
        return users.findById(challenge.getUserId())
                .filter(user -> user.getRole() == Role.SUPER_ADMIN && user.isTwoFactorEnabled())
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired security code"));
    }

    private ChallengeInfo issue(User user, TwoFactorChallenge.Purpose purpose) {
        Instant now = Instant.now();
        TwoFactorChallenge existing = challenges.findByUserIdAndPurpose(user.getId(), purpose).orElse(null);
        if (existing != null && existing.getExpiresAt().isAfter(now)
                && existing.getResendAvailableAt().isAfter(now)) {
            return new ChallengeInfo(existing.getId(),
                    Math.max(1, Duration.between(now, existing.getExpiresAt()).toSeconds()));
        }
        if (existing != null) challenges.delete(existing);

        String code = hasher.randomCode();
        TwoFactorChallenge challenge = challenges.save(TwoFactorChallenge.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .purpose(purpose)
                .codeHash(hasher.hash(code))
                .attempts(0)
                .expiresAt(now.plusSeconds(EXPIRY_SECONDS))
                .resendAvailableAt(now.plusSeconds(RESEND_SECONDS))
                .build());
        emails.sendTwoFactorCode(user.getEmail(), code, purpose.name());
        return new ChallengeInfo(challenge.getId(), EXPIRY_SECONDS);
    }

    private void verify(TwoFactorChallenge challenge, String code) {
        if (!challenge.getExpiresAt().isAfter(Instant.now())) {
            challenges.delete(challenge);
            throw ApiException.unauthorized("Invalid or expired security code");
        }
        if (challenge.getAttempts() >= MAX_ATTEMPTS) {
            challenges.delete(challenge);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts; request a new code");
        }
        if (!hasher.matches(code, challenge.getCodeHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            challenges.save(challenge);
            throw ApiException.unauthorized("Invalid or expired security code");
        }
        challenges.delete(challenge);
    }

    private User superAdmin(Long userId) {
        return users.findById(userId)
                .filter(user -> user.getRole() == Role.SUPER_ADMIN)
                .orElseThrow(() -> ApiException.forbidden("Super Admin access required"));
    }

    private TwoFactorChallenge.Purpose settingPurpose(String action) {
        try {
            TwoFactorChallenge.Purpose purpose = TwoFactorChallenge.Purpose.valueOf(action.toUpperCase());
            if (purpose == TwoFactorChallenge.Purpose.LOGIN) throw new IllegalArgumentException();
            return purpose;
        } catch (Exception ex) {
            throw ApiException.badRequest("Action must be ENABLE or DISABLE");
        }
    }
}
