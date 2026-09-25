package com.dms.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integration: Full tournament workflow & social features")
class TournamentWorkflowIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("Organizer creates tournament → match → judges score → winner, stats and leaderboard update")
    void fullTournamentLifecycle() throws Exception {
        TestUser org = signup("ORGANIZER");
        TestUser judge1 = signup("JUDGE");
        TestUser judge2 = signup("JUDGE");
        TestUser debA = signup("DEBATER");
        TestUser debB = signup("DEBATER");

        // 1. Create tournament with two schools and two judges
        JsonNode t = createTournament(org, List.of(debA.id(), debB.id()), List.of(judge1.id(), judge2.id()));
        long tId = t.get("id").asLong();
        long royal = t.at("/schools/0/id").asLong();
        long trinity = t.at("/schools/1/id").asLong();
        mvc.perform(get("/api/tournaments/" + tId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schools", hasSize(2)))
                .andExpect(jsonPath("$.judges[*].judgeCode", containsInAnyOrder("JUDGE-001", "JUDGE-002")));

        // 2. Create a match
        JsonNode match = readJson(mvc.perform(as(org, withJson(post("/api/matches"), Map.of(
                        "tournamentId", tId, "propositionSchoolId", royal, "oppositionSchoolId", trinity,
                        "topic", "This house would ban homework", "judgeIds", List.of(judge1.id(), judge2.id())))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roundNumber").value(1))
                .andExpect(jsonPath("$.status").value("UPCOMING"))
                .andReturn());
        long matchId = match.get("id").asLong();

        // 3. Judges were notified
        mvc.perform(as(judge1, get("/api/notifications")))
                .andExpect(jsonPath("$[*].title", hasItem("New Judging Assignment")));

        // 4. Both judges submit; Trinity (opposition) wins on average
        submit(judge1, matchId, 70, 72, debB.id());
        mvc.perform(as(org, get("/api/matches/" + matchId))).andExpect(jsonPath("$.status").value("UPCOMING"));
        submit(judge2, matchId, 65, 74, debB.id());

        // 5. Match completed with winner and best speaker
        mvc.perform(as(org, get("/api/matches/" + matchId)))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.winnerSchool.name").value("Trinity College"))
                .andExpect(jsonPath("$.bestSpeaker.id").value((int) debB.id()));

        // 6. Stats and leaderboard reflect the result
        mvc.perform(get("/api/stats/debater/" + debB.id()))
                .andExpect(jsonPath("$.wins").value(1))
                .andExpect(jsonPath("$.playerOfMatchCount").value(1));
        mvc.perform(get("/api/stats/debater/" + debA.id()))
                .andExpect(jsonPath("$.losses").value(1));
        mvc.perform(get("/api/stats/judge/" + judge1.id()))
                .andExpect(jsonPath("$.matchesJudged").value(1));
        mvc.perform(get("/api/tournaments/" + tId + "/leaderboard"))
                .andExpect(jsonPath("$[0].schoolName").value("Trinity College"))
                .andExpect(jsonPath("$[0].points").value(2));

        // 7. A judge cannot submit twice
        mvc.perform(as(judge1, withJson(post("/api/score-sheets/submit"), Map.of(
                        "matchId", matchId, "judgeId", judge1.id(), "propositionTotal", 1, "oppositionTotal", 1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("already submitted")));
    }

    private void submit(TestUser judge, long matchId, double prop, double opp, long bestSpeaker) throws Exception {
        mvc.perform(as(judge, withJson(post("/api/score-sheets/submit"), Map.of(
                        "matchId", matchId, "judgeId", judge.id(),
                        "propositionScoresJson", "{}", "oppositionScoresJson", "{}",
                        "propositionTotal", prop, "oppositionTotal", opp,
                        "selectedBestSpeakerId", bestSpeaker, "comments", "Well argued"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Score sheet submitted successfully"));
    }

    @Test
    @DisplayName("Connections: request → accept → both see each other → block")
    void connectionFlow() throws Exception {
        TestUser a = signup("DEBATER");
        TestUser b = signup("DEBATER");

        JsonNode req = readJson(mvc.perform(as(a, post("/api/connections/request/" + b.id())))
                .andExpect(status().isOk()).andReturn());
        mvc.perform(as(b, get("/api/connections/status/" + a.id())))
                .andExpect(jsonPath("$.status").value("PENDING_RECEIVED"));
        mvc.perform(as(b, org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .put("/api/connections/accept/" + req.get("id").asLong())))
                .andExpect(status().isOk());
        mvc.perform(as(a, get("/api/connections")))
                .andExpect(jsonPath("$[*].id", hasItem((int) b.id())));
        mvc.perform(as(a, get("/api/connections/count/" + a.id()))).andExpect(jsonPath("$.count").value(1));

        mvc.perform(as(a, post("/api/connections/block/" + b.id()))).andExpect(status().isOk());
        mvc.perform(as(b, post("/api/connections/request/" + a.id())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Action blocked"));
    }

    @Test
    @DisplayName("Messages, diary posts, calendar events and news can be created and read back")
    void socialContent() throws Exception {
        TestUser a = signup("DEBATER");
        TestUser b = signup("JUDGE");

        mvc.perform(as(a, withJson(post("/api/messages"), Map.of("receiverId", b.id(), "text", "Good luck!"))))
                .andExpect(status().isOk());
        mvc.perform(as(b, get("/api/messages")))
                .andExpect(jsonPath("$[*].text", hasItem("Good luck!")));

        JsonNode diary = readJson(mvc.perform(as(a, withJson(post("/api/diaries"),
                        Map.of("title", "Round 1", "content", "We won our first round."))))
                .andExpect(status().isOk()).andReturn());
        long diaryId = diary.get("id").asLong();
        mvc.perform(as(b, post("/api/diaries/" + diaryId + "/like"))).andExpect(status().isOk());
        mvc.perform(as(b, withJson(post("/api/diaries/" + diaryId + "/comment"), Map.of("comment", "Congrats!"))))
                .andExpect(status().isOk());
        mvc.perform(get("/api/diaries/user/" + a.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Round 1"));
        mvc.perform(as(b, org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .put("/api/diaries/" + diaryId + "/verify").param("verified", "true")))
                .andExpect(status().isBadRequest());

        mvc.perform(as(a, withJson(post("/api/calendar"), Map.of(
                        "title", "Practice", "eventType", "OTHER",
                        "startTime", "2026-10-01T10:00:00", "endTime", "2026-10-01T12:00:00",
                        "reminderEnabled", true))))
                .andExpect(status().isOk());
        mvc.perform(as(a, get("/api/calendar"))).andExpect(jsonPath("$[0].title").value("Practice"));

        mvc.perform(as(a, withJson(post("/api/news"), Map.of(
                        "title", "Finals announced", "category", "LATEST_NEWS", "content", "Finals on Friday"))))
                .andExpect(status().isOk());
        mvc.perform(get("/api/news")).andExpect(jsonPath("$[*].title", hasItem("Finals announced")));
    }

    @Test
    @DisplayName("Search finds debaters and tournaments by name")
    void search() throws Exception {
        TestUser org = signup("ORGANIZER");
        mvc.perform(as(org, withJson(post("/api/tournaments"), Map.of(
                "name", "Zebra Invitational", "debateType", "TRADITIONAL", "tournamentType", "LEAGUE"))))
                .andExpect(status().isOk());

        mvc.perform(get("/api/search").param("query", "Zebra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tournaments[*].name", hasItem("Zebra Invitational")));
    }

    @Test
    @DisplayName("Score-sheet template saved with the tournament can be read back")
    void scoreTemplateReadBack() throws Exception {
        TestUser org = signup("ORGANIZER");
        JsonNode t = createTournament(org, List.of(signup("DEBATER").id(), signup("DEBATER").id()), List.of());

        var res = mvc.perform(as(org, get("/api/score-templates/" + t.get("id").asLong()))).andReturn().getResponse();

        assertThat(res.getStatus())
                .as("GET /api/score-templates/{id} response body: %s", res.getContentAsString())
                .isEqualTo(200);
        assertThat(res.getContentAsString()).contains("\"name\":\"Default\"");
    }

    @Test
    @DisplayName("A judge's submitted score sheet can be read back (used for 'already submitted' check)")
    void submissionReadBack() throws Exception {
        TestUser org = signup("ORGANIZER");
        TestUser judge = signup("JUDGE");
        TestUser speaker = signup("DEBATER");
        JsonNode t = createTournament(org, List.of(speaker.id(), signup("DEBATER").id()), List.of(judge.id()));
        long matchId = readJson(mvc.perform(as(org, withJson(post("/api/matches"), Map.of(
                "tournamentId", t.get("id").asLong(),
                "propositionSchoolId", t.at("/schools/0/id").asLong(),
                "oppositionSchoolId", t.at("/schools/1/id").asLong(),
                "topic", "Read-back topic", "judgeIds", List.of(judge.id()))))).andReturn()).get("id").asLong();
        submit(judge, matchId, 60, 50, speaker.id());

        var res = mvc.perform(as(judge, get("/api/score-sheets/" + matchId + "/" + judge.id()))).andReturn().getResponse();

        assertThat(res.getStatus())
                .as("GET /api/score-sheets/{match}/{judge} response body: %s", res.getContentAsString())
                .isEqualTo(200);
    }

    @Test
    @DisplayName("Requests for missing records return 404 Not Found")
    void notFound() throws Exception {
        mvc.perform(get("/api/tournaments/999999")).andExpect(status().isNotFound());
        mvc.perform(as(signup("DEBATER"), get("/api/matches/999999"))).andExpect(status().isNotFound());
        mvc.perform(get("/api/users/999999")).andExpect(status().isNotFound());
    }
}
