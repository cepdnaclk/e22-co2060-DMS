package com.dms.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Boots the full application (security filter chain, controllers, JPA) against an
 * in-memory H2 database and talks to it over MockMvc with real JWT tokens.
 */
@SpringBootTest
@AutoConfigureMockMvc
abstract class IntegrationTestBase {

    private static final AtomicInteger SEQ = new AtomicInteger();

    @Autowired protected MockMvc mvc;
    @Autowired protected ObjectMapper json;

    /** A signed-up user: database id, username and bearer token. */
    protected record TestUser(long id, String username, String token) {
        String bearer() { return "Bearer " + token; }
    }

    protected TestUser signup(String role) throws Exception {
        String username = role.toLowerCase() + "_" + SEQ.incrementAndGet() + "_" + System.nanoTime() % 100000;
        Map<String, Object> body = Map.of(
                "fullName", "Test " + username,
                "username", username,
                "email", username + "@test.dms",
                "password", "password123",
                "role", role);
        JsonNode res = readJson(mvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn());
        return new TestUser(res.at("/user/id").asLong(), username, res.get("token").asText());
    }

    protected JsonNode readJson(MvcResult result) throws Exception {
        return json.readTree(result.getResponse().getContentAsString());
    }

    protected MockHttpServletRequestBuilder withJson(MockHttpServletRequestBuilder req, Object body) throws Exception {
        return req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    }

    protected MockHttpServletRequestBuilder as(TestUser user, MockHttpServletRequestBuilder req) {
        return user == null ? req : req.header("Authorization", user.bearer());
    }

    /** Creates a tournament with two schools (one debater each) and the given judges. */
    protected JsonNode createTournament(TestUser organizer, List<Long> debaterIds, List<Long> judgeIds) throws Exception {
        Map<String, Object> body = Map.of(
                "name", "Integration Cup " + SEQ.incrementAndGet(),
                "debateType", "ASIAN_PARLIAMENTARY",
                "tournamentType", "KNOCKOUT",
                "schools", List.of(
                        Map.of("name", "Royal College", "debaterIds", List.of(debaterIds.get(0))),
                        Map.of("name", "Trinity College", "debaterIds", List.of(debaterIds.get(1)))),
                "judgeIds", judgeIds,
                "scoreTemplate", Map.of("name", "Default", "criteriaJson", "[{\"name\":\"Matter\",\"max\":40}]"));
        return readJson(mvc.perform(as(organizer, withJson(post("/api/tournaments"), body)))
                .andExpect(status().isOk())
                .andReturn());
    }
}
