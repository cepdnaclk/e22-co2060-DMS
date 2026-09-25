package com.dms.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Role-Based Access Control matrix: every organizer-only endpoint is called as
 * ORGANIZER, JUDGE, DEBATER and with no token.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Integration: Role-Based Access Control (RBAC)")
class RbacIntegrationTest extends IntegrationTestBase {

    TestUser organizer, judge, debater, debater2;
    long tournamentId, schoolA, schoolB;

    @BeforeAll
    void seed() throws Exception {
        organizer = signup("ORGANIZER");
        judge = signup("JUDGE");
        debater = signup("DEBATER");
        debater2 = signup("DEBATER");
        JsonNode t = createTournament(organizer, List.of(debater.id(), debater2.id()), List.of(judge.id()));
        tournamentId = t.get("id").asLong();
        schoolA = t.at("/schools/0/id").asLong();
        schoolB = t.at("/schools/1/id").asLong();
    }

    /** Organizer-only endpoints, each built fresh per call. */
    Map<String, Supplier<MockHttpServletRequestBuilder>> organizerOnlyEndpoints() {
        return Map.of(
                "POST /api/tournaments", () -> json(post("/api/tournaments"), Map.of(
                        "name", "RBAC Cup", "debateType", "TRADITIONAL", "tournamentType", "LEAGUE")),
                "POST /api/tournaments/{id}/judges", () -> json(post("/api/tournaments/" + tournamentId + "/judges"),
                        Map.of("judgeId", judge.id())),
                "POST /api/matches", () -> json(post("/api/matches"), Map.of(
                        "tournamentId", tournamentId, "propositionSchoolId", schoolA,
                        "oppositionSchoolId", schoolB, "topic", "RBAC topic")),
                "POST /api/tournaments/{id}/generate-next-round", () -> post("/api/tournaments/" + tournamentId + "/generate-next-round"),
                "POST /api/score-templates", () -> json(post("/api/score-templates"), Map.of(
                        "tournamentId", tournamentId, "name", "T", "criteriaJson", "[]")),
                "POST /api/score-sheets/{id}/reopen", () -> post("/api/score-sheets/999999/reopen"),
                "DELETE /api/tournaments/{id}", () -> delete("/api/tournaments/999999"));
    }

    private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder b, Object body) {
        try { return withJson(b, body); } catch (Exception e) { throw new RuntimeException(e); }
    }

    Stream<Arguments> matrix() {
        List<Arguments> args = new ArrayList<>();
        organizerOnlyEndpoints().keySet().stream().sorted().forEach(ep -> {
            args.add(Arguments.of(ep, "ORGANIZER"));
            args.add(Arguments.of(ep, "JUDGE"));
            args.add(Arguments.of(ep, "DEBATER"));
            args.add(Arguments.of(ep, "ANONYMOUS"));
        });
        return args.stream();
    }

    @ParameterizedTest(name = "{0} as {1}")
    @MethodSource("matrix")
    @DisplayName("Organizer-only endpoint access")
    void organizerOnlyMatrix(String endpoint, String role) throws Exception {
        TestUser caller = switch (role) {
            case "ORGANIZER" -> organizer;
            case "JUDGE" -> judge;
            case "DEBATER" -> debater;
            default -> null;
        };
        var response = mvc.perform(as(caller, organizerOnlyEndpoints().get(endpoint).get()))
                .andReturn().getResponse();
        int status = response.getStatus();

        if (role.equals("ORGANIZER")) {
            assertThat(status).as("organizer must pass the security check").isNotIn(401, 403);
            assertThat(response.getContentAsString()).doesNotContain("Access Denied");
        } else {
            // The action must be blocked before it runs (no 2xx, and never reaches business logic)
            assertThat(status).as(role + " must be blocked").isBetween(400, 403);
            if (!role.equals("ANONYMOUS")) {
                assertThat(response.getContentAsString()).contains("Access Denied");
            }
        }
    }

    @Test
    @DisplayName("Blocked role gets HTTP 403 Forbidden (correct status code)")
    void deniedRoleGets403() throws Exception {
        mvc.perform(as(debater, withJson(post("/api/tournaments"), Map.of(
                        "name", "Not allowed", "debateType", "TRADITIONAL", "tournamentType", "LEAGUE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Missing token on a protected endpoint gets HTTP 401 Unauthorized (correct status code)")
    void missingTokenGets401() throws Exception {
        mvc.perform(post("/api/matches")).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "GET {0} is public")
    @ValueSource(strings = {"/api/tournaments", "/api/news", "/api/users/top-debaters", "/api/users/organizers",
            "/api/search?query=a", "/api/matches/live"})
    @DisplayName("Public read endpoints work without login")
    void publicEndpoints(String url) throws Exception {
        mvc.perform(get(url)).andExpect(status().isOk());
    }

    @ParameterizedTest(name = "GET {0} needs login")
    @ValueSource(strings = {"/api/notifications", "/api/messages", "/api/calendar", "/api/connections",
            "/api/notifications/unread-count", "/api/matches/1"})
    @DisplayName("Private endpoints are blocked without a token")
    void privateEndpointsNeedToken(String url) throws Exception {
        int status = mvc.perform(get(url)).andReturn().getResponse().getStatus();
        assertThat(status).as("anonymous request must be blocked").isIn(401, 403);
    }

    @Test
    @DisplayName("GET /api/auth/me without a token returns 401 (not a server-side error)")
    void meWithoutToken() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Private endpoint with a valid token succeeds")
    void privateEndpointWithToken() throws Exception {
        mvc.perform(as(debater, get("/api/notifications"))).andExpect(status().isOk());
    }

    @ParameterizedTest(name = "token = \"{0}\"")
    @ValueSource(strings = {"garbage", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcmdhbml6ZXIxIn0.invalidsignature"})
    @DisplayName("Forged or malformed tokens are rejected")
    void forgedTokens(String token) throws Exception {
        int status = mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getStatus();
        assertThat(status).as("forged token must be rejected").isIn(401, 403);
    }

    @Test
    @DisplayName("Expired token gets HTTP 401 so the frontend can show 'session expired' and log out")
    void expiredTokenGets401() throws Exception {
        com.dms.security.JwtUtil expired = new com.dms.security.JwtUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(expired, "secret",
                "test-secret-key-that-is-at-least-32-characters-long");
        org.springframework.test.util.ReflectionTestUtils.setField(expired, "expiration", -1000L);
        String token = expired.generateToken(debater.username(), "DEBATER");

        mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
