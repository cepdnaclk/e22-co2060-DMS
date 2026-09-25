package com.dms.unit;

import com.dms.dto.ScoreSheetSubmissionRequest;
import com.dms.entity.*;
import com.dms.repository.*;
import com.dms.service.NotificationService;
import com.dms.service.ScoreSheetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static com.dms.unit.Fixtures.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Unit: ScoreSheetService (judge scoring & match result)")
class ScoreSheetServiceTest {

    @Mock ScoreSheetSubmissionRepository submissionRepository;
    @Mock ScoreSheetTemplateRepository templateRepository;
    @Mock MatchRepository matchRepository;
    @Mock MatchJudgeRepository matchJudgeRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @Mock DebaterStatsRepository debaterStatsRepository;
    @Mock JudgeStatsRepository judgeStatsRepository;
    @Mock SchoolDebaterRepository schoolDebaterRepository;
    @Mock TournamentRepository tournamentRepository;
    @InjectMocks ScoreSheetService service;

    User organizer, judge1, judge2, debaterA, debaterB;
    School prop, opp;
    Match match;
    MatchJudge mj1, mj2;

    @BeforeEach
    void setUp() {
        organizer = user(1, "org", User.Role.ORGANIZER);
        judge1 = user(10, "judge1", User.Role.JUDGE);
        judge2 = user(11, "judge2", User.Role.JUDGE);
        debaterA = user(20, "debA", User.Role.DEBATER);
        debaterB = user(21, "debB", User.Role.DEBATER);
        Tournament t = tournament(100, organizer);
        prop = school(200, "Royal", t);
        opp = school(201, "Trinity", t);
        match = match(300, t, prop, opp);
        mj1 = MatchJudge.builder().id(1L).match(match).judge(judge1).build();
        mj2 = MatchJudge.builder().id(2L).match(match).judge(judge2).build();

        when(userRepository.findByUsername("judge1")).thenReturn(Optional.of(judge1));
        when(userRepository.findByUsername("judge2")).thenReturn(Optional.of(judge2));
        when(userRepository.findById(20L)).thenReturn(Optional.of(debaterA));
        when(userRepository.findById(21L)).thenReturn(Optional.of(debaterB));
        when(matchRepository.findById(300L)).thenReturn(Optional.of(match));
        when(matchJudgeRepository.findByMatchAndJudge(match, judge1)).thenReturn(Optional.of(mj1));
        when(matchJudgeRepository.findByMatchAndJudge(match, judge2)).thenReturn(Optional.of(mj2));
        when(matchJudgeRepository.findByMatch(match)).thenReturn(List.of(mj1, mj2));
        when(submissionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(schoolDebaterRepository.findBySchool(prop))
                .thenReturn(List.of(SchoolDebater.builder().school(prop).debater(debaterA).build()));
        when(schoolDebaterRepository.findBySchool(opp))
                .thenReturn(List.of(SchoolDebater.builder().school(opp).debater(debaterB).build()));
        when(debaterStatsRepository.findByDebater(any())).thenAnswer(inv ->
                Optional.of(DebaterStats.builder().debater(inv.getArgument(0)).build()));
    }

    private ScoreSheetSubmissionRequest req(long judgeId, double propTotal, double oppTotal, Long bestSpeaker) {
        ScoreSheetSubmissionRequest r = new ScoreSheetSubmissionRequest();
        r.setMatchId(300L);
        r.setJudgeId(judgeId);
        r.setPropositionTotal(propTotal);
        r.setOppositionTotal(oppTotal);
        r.setSelectedBestSpeakerId(bestSpeaker);
        return r;
    }

    private ScoreSheetSubmission submission(User judge, double p, double o, User best) {
        return ScoreSheetSubmission.builder().match(match).judge(judge)
                .propositionTotal(p).oppositionTotal(o).selectedBestSpeaker(best).build();
    }

    @Test
    @DisplayName("A judge cannot submit scores on behalf of another judge")
    void rejectsImpersonation() {
        assertThatThrownBy(() -> service.submitScoreSheet(req(11, 70, 60, null), "judge1"))
                .hasMessageContaining("only submit scores as yourself");
        verify(submissionRepository, never()).save(any());
    }

    @Test
    @DisplayName("A judge not assigned to the match cannot submit scores")
    void rejectsUnassignedJudge() {
        when(matchJudgeRepository.findByMatchAndJudge(match, judge1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.submitScoreSheet(req(10, 70, 60, null), "judge1"))
                .hasMessageContaining("not assigned");
    }

    @Test
    @DisplayName("A judge cannot submit twice for the same match")
    void rejectsDoubleSubmission() {
        when(submissionRepository.existsByMatchAndJudge(match, judge1)).thenReturn(true);

        assertThatThrownBy(() -> service.submitScoreSheet(req(10, 70, 60, null), "judge1"))
                .hasMessageContaining("already submitted");
    }

    @Test
    @DisplayName("First of two judges submitting marks them submitted but leaves match open")
    void partialSubmissionKeepsMatchOpen() {
        mj2.setSubmitted(false);

        service.submitScoreSheet(req(10, 70, 60, 20L), "judge1");

        assertThat(mj1.getSubmitted()).isTrue();
        assertThat(match.getStatus()).isEqualTo(Match.Status.UPCOMING);
        assertThat(match.getWinnerSchool()).isNull();
        verify(notificationService).send(eq(organizer), eq("Score Sheet Submitted"), anyString());
    }

    @Test
    @DisplayName("When all judges submit, winner is decided by average total and stats are updated")
    void allSubmittedCompletesMatch() {
        mj1.setSubmitted(true);
        when(submissionRepository.findByMatch(match)).thenReturn(List.of(
                submission(judge1, 70, 60, debaterB),
                submission(judge2, 50, 75, debaterB)));   // avg prop 60, avg opp 67.5

        service.submitScoreSheet(req(11, 50, 75, 21L), "judge2");

        assertThat(match.getStatus()).isEqualTo(Match.Status.COMPLETED);
        assertThat(match.getWinnerSchool()).isSameAs(opp);
        assertThat(match.getBestSpeaker()).isSameAs(debaterB);
        verify(debaterStatsRepository).save(argThat(s -> s.getDebater() == debaterB
                && s.getWins() == 1 && s.getMatchesPlayed() == 1 && s.getPlayerOfMatchCount() == 1));
        verify(debaterStatsRepository).save(argThat(s -> s.getDebater() == debaterA
                && s.getLosses() == 1 && s.getWins() == 0));
        verify(notificationService).send(eq(organizer), eq("Match Completed"), contains("Trinity"));
    }

    @Test
    @DisplayName("Tie on average score goes to the proposition (documented rule)")
    void tieGoesToProposition() {
        mj1.setSubmitted(true);
        when(submissionRepository.findByMatch(match)).thenReturn(List.of(
                submission(judge1, 60, 70, null),
                submission(judge2, 70, 60, null)));

        service.submitScoreSheet(req(11, 70, 60, null), "judge2");

        assertThat(match.getWinnerSchool()).isSameAs(prop);
        assertThat(match.getBestSpeaker()).isNull();
    }

    @Test
    @DisplayName("Reopening a sheet un-marks the judge as submitted")
    void reopen() {
        ScoreSheetSubmission sub = submission(judge1, 70, 60, null);
        mj1.setSubmitted(true);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(sub));

        service.reopenScoreSheet(5L);

        assertThat(sub.getReopened()).isTrue();
        assertThat(mj1.getSubmitted()).isFalse();
    }

    @Test
    @DisplayName("Reopening a missing sheet reports 'not found'")
    void reopenMissing() {
        when(submissionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.reopenScoreSheet(99L)).hasMessageContaining("not found");
    }
}
