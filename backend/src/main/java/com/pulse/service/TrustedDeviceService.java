package com.pulse.service;

import com.pulse.entity.TrustedDevice;
import com.pulse.entity.TwoFactorChallenge;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.TrustedDeviceRepository;
import com.pulse.repository.TwoFactorChallengeRepository;
import com.pulse.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class TrustedDeviceService {
    public static final long DEVICE_LIFETIME_SECONDS = 90L * 24 * 60 * 60;
    private static final int MAX_ATTEMPTS = 5;

    public record DeviceChallenge(UUID challengeId, long expiresInSeconds) {}
    public record VerifiedDevice(User user, String token) {}

    private final UserRepository users;
    private final TrustedDeviceRepository devices;
    private final TwoFactorChallengeRepository challenges;
    private final SecurityTokenHasher hasher;
    private final EmailGateway emails;

    public TrustedDeviceService(UserRepository users, TrustedDeviceRepository devices,
                                TwoFactorChallengeRepository challenges, SecurityTokenHasher hasher,
                                EmailGateway emails) {
        this.users = users;
        this.devices = devices;
        this.challenges = challenges;
        this.hasher = hasher;
        this.emails = emails;
    }

    @Transactional
    public boolean isTrusted(Long userId, String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return false;
        TrustedDevice device = devices.findByUserIdAndTokenHash(userId, hasher.hash(rawToken)).orElse(null);
        if (device == null) return false;
        if (!device.getExpiresAt().isAfter(Instant.now())) {
            devices.delete(device);
            return false;
        }
        device.setLastUsedAt(Instant.now());
        return true;
    }

    @Transactional
    public DeviceChallenge issue(User user) {
        Instant now = Instant.now();
        TwoFactorChallenge old = challenges.findByUserIdAndPurpose(user.getId(), TwoFactorChallenge.Purpose.NEW_DEVICE)
                .orElse(null);
        if (old != null) challenges.delete(old);
        String code = hasher.randomCode();
        TwoFactorChallenge challenge = challenges.save(TwoFactorChallenge.builder()
                .id(UUID.randomUUID()).userId(user.getId()).purpose(TwoFactorChallenge.Purpose.NEW_DEVICE)
                .codeHash(hasher.hash(code)).attempts(0)
                .expiresAt(now.plusSeconds(TwoFactorService.EXPIRY_SECONDS))
                .resendAvailableAt(now.plusSeconds(60)).build());
        emails.sendNewDeviceCode(user.getEmail(), code);
        return new DeviceChallenge(challenge.getId(), TwoFactorService.EXPIRY_SECONDS);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public VerifiedDevice verify(UUID challengeId, String code, String userAgent) {
        TwoFactorChallenge challenge = challenges.findById(challengeId)
                .filter(c -> c.getPurpose() == TwoFactorChallenge.Purpose.NEW_DEVICE)
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired device code"));
        if (!challenge.getExpiresAt().isAfter(Instant.now())) {
            challenges.delete(challenge);
            throw ApiException.unauthorized("Invalid or expired device code");
        }
        if (challenge.getAttempts() >= MAX_ATTEMPTS) {
            challenges.delete(challenge);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts; sign in again");
        }
        if (!hasher.matches(code, challenge.getCodeHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            challenges.save(challenge);
            throw ApiException.unauthorized("Invalid or expired device code");
        }
        User user = users.findById(challenge.getUserId())
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired device code"));
        challenges.delete(challenge);
        String token = hasher.randomToken();
        devices.save(TrustedDevice.builder().userId(user.getId()).tokenHash(hasher.hash(token))
                .userAgent(userAgent == null ? null : userAgent.substring(0, Math.min(500, userAgent.length())))
                .expiresAt(Instant.now().plusSeconds(DEVICE_LIFETIME_SECONDS)).build());
        return new VerifiedDevice(user, token);
    }
}
