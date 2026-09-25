package com.dms.unit;

import com.dms.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Unit: JwtUtil (token generation & validation)")
class JwtUtilTest {

    private static final String SECRET = "unit-test-secret-key-that-is-at-least-32-chars";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = newJwtUtil(SECRET, 60_000);
    }

    private static JwtUtil newJwtUtil(String secret, long expirationMs) {
        JwtUtil util = new JwtUtil();
        ReflectionTestUtils.setField(util, "secret", secret);
        ReflectionTestUtils.setField(util, "expiration", expirationMs);
        return util;
    }

    @Test
    @DisplayName("Generated token is valid and carries the username")
    void generateAndValidate() {
        String token = jwtUtil.generateToken("debater1", "DEBATER");

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("debater1");
    }

    @Test
    @DisplayName("Expired token is rejected")
    void expiredTokenIsRejected() {
        JwtUtil expiring = newJwtUtil(SECRET, -1_000);
        String token = expiring.generateToken("debater1", "DEBATER");

        assertThat(jwtUtil.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("Tampered token is rejected")
    void tamperedTokenIsRejected() {
        String token = jwtUtil.generateToken("debater1", "DEBATER");
        String[] parts = token.split("\\.");
        // Swap the payload for another user's payload but keep the original signature
        String otherPayload = jwtUtil.generateToken("organizer1", "ORGANIZER").split("\\.")[1];
        String forged = parts[0] + "." + otherPayload + "." + parts[2];

        assertThat(jwtUtil.validateToken(forged)).isFalse();
    }

    @Test
    @DisplayName("Token signed with a different secret is rejected")
    void tokenFromOtherSecretIsRejected() {
        JwtUtil attacker = newJwtUtil("a-completely-different-secret-key-of-32-chars", 60_000);
        String token = attacker.generateToken("organizer1", "ORGANIZER");

        assertThat(jwtUtil.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("Garbage, empty and null tokens are rejected without throwing")
    void garbageTokensAreRejected() {
        assertThat(jwtUtil.validateToken("not-a-jwt")).isFalse();
        assertThat(jwtUtil.validateToken("")).isFalse();
        assertThat(jwtUtil.validateToken(null)).isFalse();
    }
}
