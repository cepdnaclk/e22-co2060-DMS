package com.dms.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Ownership checks (a logged-in user must not be able to act on another user's data)
 * and a data-exposure check. These go beyond role checks: they test *whose* resource it is.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Integration: Ownership & data-exposure security")
class OwnershipSecurityIntegrationTest extends IntegrationTestBase {

    TestUser alice, bob, organizerA, organizerB, judge;
    long tournamentId;

    @BeforeAll
    void seed() throws Exception {
        alice = signup("DEBATER");
        bob = signup("DEBATER");
        organizerA = signup("ORGANIZER");
        organizerB = signup("ORGANIZER");
        judge = signup("JUDGE");
        JsonNode t = createTournament(organizerA, List.of(alice.id(), bob.id()), List.of(judge.id()));
        tournamentId = t.get("id").asLong();
    }

    private int statusOf(org.springframework.test.web.servlet.RequestBuilder req) throws Exception {
        return mvc.perform(req).andReturn().getResponse().getStatus();
    }

    @Test
    @DisplayName("A user cannot edit another user's profile")
    void cannotEditOthersProfile() throws Exception {
        int status = statusOf(as(alice, withJson(put("/api/users/" + bob.id()), Map.of("bio", "hacked by alice"))));

        assertThat(status).as("PUT /api/users/{bob} as alice").isEqualTo(403);
    }

    @Test
    @DisplayName("A user can edit their own profile")
    void canEditOwnProfile() throws Exception {
        mvc.perform(as(alice, withJson(put("/api/users/" + alice.id()), Map.of("bio", "Debater from Kandy"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bio").value("Debater from Kandy"));
    }

    @Test
    @DisplayName("A user cannot post a discussion comment pretending to be someone else")
    void cannotImpersonateInDiscussion() throws Exception {
        int status = statusOf(as(alice, withJson(post("/api/discussion"), Map.of(
                "tournamentId", tournamentId, "userId", bob.id(), "comment", "Posted as Bob"))));

        assertThat(status).as("POST /api/discussion with someone else's userId").isEqualTo(403);
    }

    @Test
    @DisplayName("A user cannot delete another user's discussion comment")
    void cannotDeleteOthersComment() throws Exception {
        JsonNode comment = readJson(mvc.perform(as(bob, withJson(post("/api/discussion"), Map.of(
                        "tournamentId", tournamentId, "userId", bob.id(), "comment", "Bob's opinion"))))
                .andExpect(status().isOk()).andReturn());

        int status = statusOf(as(alice, delete("/api/discussion/" + comment.get("id").asLong())));

        assertThat(status).as("DELETE bob's comment as alice").isEqualTo(403);
    }

    @Test
    @DisplayName("An organizer cannot delete another organizer's tournament")
    void cannotDeleteOtherOrganizersTournament() throws Exception {
        JsonNode t = readJson(mvc.perform(as(organizerA, withJson(post("/api/tournaments"), Map.of(
                        "name", "A's private cup", "debateType", "TRADITIONAL", "tournamentType", "LEAGUE"))))
                .andExpect(status().isOk()).andReturn());

        int status = statusOf(as(organizerB, delete("/api/tournaments/" + t.get("id").asLong())));

        assertThat(status).as("DELETE organizer A's tournament as organizer B").isEqualTo(403);
    }

    @Test
    @DisplayName("A user cannot mark another user's notification as read")
    void cannotReadOthersNotification() throws Exception {
        // alice was notified when she was registered into the tournament
        JsonNode notes = readJson(mvc.perform(as(alice, get("/api/notifications"))).andReturn());
        long noteId = notes.get(0).get("id").asLong();

        int status = statusOf(as(bob, put("/api/notifications/" + noteId + "/read")));

        assertThat(status).as("PUT alice's notification /read as bob").isEqualTo(403);
    }

    @Test
    @DisplayName("A judge submitting scores as another judge is refused with 403 Forbidden")
    void judgeImpersonationStatusCode() throws Exception {
        TestUser otherJudge = signup("JUDGE");
        int status = statusOf(as(otherJudge, withJson(post("/api/score-sheets/submit"), Map.of(
                "matchId", 1, "judgeId", judge.id(), "propositionTotal", 70, "oppositionTotal", 60))));

        assertThat(status).as("submitting as another judge").isEqualTo(403);
    }

    @Test
    @DisplayName("Public user list must not expose e-mail addresses to anonymous visitors")
    void publicUserListHidesEmails() throws Exception {
        mvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].email", not(hasItem(alice.username() + "@test.dms"))));
    }
}
