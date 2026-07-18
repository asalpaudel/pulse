package com.pulse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Component
public class SecurityTokenHasher {

    private final byte[] pepper;
    private final SecureRandom random = new SecureRandom();

    public SecurityTokenHasher(@Value("${pulse.otp.pepper:${pulse.jwt.secret}}") String pepper) {
        if (pepper == null || pepper.length() < 32) {
            throw new IllegalArgumentException("Security token pepper must contain at least 32 characters");
        }
        this.pepper = pepper.getBytes(StandardCharsets.UTF_8);
    }

    public String randomCode() {
        return "%06d".formatted(random.nextInt(1_000_000));
    }

    public String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(pepper, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash security token", ex);
        }
    }

    public boolean matches(String value, String expectedHash) {
        return MessageDigest.isEqual(hash(value).getBytes(StandardCharsets.US_ASCII),
                expectedHash.getBytes(StandardCharsets.US_ASCII));
    }
}
