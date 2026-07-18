package com.pulse.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTests {

    private static final String SECRET = "test-pulse-secret-key-with-at-least-thirty-two-bytes";

    @Test
    void generatedTokensContainTheAuthenticatedUserClaims() {
        JwtService service = new JwtService(SECRET, 60_000);

        Claims claims = service.parse(service.generateToken(42L, "donor@pulse.test", "DONOR"));

        assertEquals("42", claims.getSubject());
        assertEquals("donor@pulse.test", claims.get("email", String.class));
        assertEquals("DONOR", claims.get("role", String.class));
    }

    @Test
    void tokensCannotBeParsedWithAnotherSigningKey() {
        JwtService issuer = new JwtService(SECRET, 60_000);
        JwtService verifier = new JwtService("another-test-secret-key-with-at-least-thirty-two-bytes", 60_000);

        String token = issuer.generateToken(42L, "donor@pulse.test", "DONOR");

        assertThrows(JwtException.class, () -> verifier.parse(token));
    }
}
