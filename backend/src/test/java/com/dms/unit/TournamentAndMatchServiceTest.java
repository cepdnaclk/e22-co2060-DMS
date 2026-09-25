package com.dms.unit;

import com.dms.dto.CreateMatchRequest;
import com.dms.dto.CreateTournamentRequest;
import com.dms.entity.*;
import com.dms.repository.*;
import com.dms.service.MatchService;
import com.dms.service.NotificationService;
import com.dms.service.TournamentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
@DisplayName("Unit: Tournament & Match services")
class TournamentAndMatchServiceTest {

    @Mock TournamentRepository tournamentRepository;
    @Mock SchoolRepository schoolRepository;
    @Mock SchoolDebaterRepository schoolDebaterRepository;
    @Mock TournamentJudgeRepository tournamentJudgeRepository;
    @Mock ScoreSheetTemplateRepository scoreSheetTemplateRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @Mock MatchRepository matchRepository;
    @Mock MatchJudgeRepository matchJudgeRepository;

    @InjectMocks TournamentService tournamentService;
    @InjectMocks MatchService matchService;

    User organizer = user(1, "org", User.Role.ORGANIZER);
    User judge = user(10, "judge", User.Role.JUDGE);
    User debater = user(20, "deb", User.Role.DEBATER);
    Tournament tournament = tournament(100, organizer);

    @BeforeEach
    void common() {
        when(userRepository.findByUsername("org")).thenReturn(Optional.of(organizer));
        when(userRepository.findById(10L)).thenReturn(Optional.of(judge));
        when(userRepository.findById(20L)).thenReturn(Optional.of(debater));
        when(tournamentRepository.findById(100L)).thenReturn(Optional.of(tournament));
        when(tournamentRepository.save(any())).thenAnswer(inv -> {
            Tournament t = inv.getArgument(0);
            t.setId(100L);
            return t;
        });
        when(schoolRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(tournamentJudgeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Nested
    @DisplayName("TournamentService")
    class TournamentTests {

        private CreateTournamentRequest request(List<Long> debaters, List<Long> judges) {
            CreateTournamentRequest.SchoolInput s = new CreateTournamentRequest.SchoolInput();
            s.setName("Royal");
            s.setDebaterIds(debaters);
            CreateTournamentRequest req = new CreateTournamentRequest();
            req.setName("Nationals");
            req.setDebateType(Tournament.DebateType.ASIAN_PARLIAMENTARY);
            req.setTournamentType(Tournament.TournamentType.KNOCKOUT);
            req.setSchools(List.of(s));
            req.setJudgeIds(judges);
            CreateTournamentRequest.ScoreTemplateInput tmpl = new CreateTournamentRequest.ScoreTemplateInput();
            tmpl.setName("Default");
            tmpl.setCriteriaJson("[]");
            req.setScoreTemplate(tmpl);
            return req;
        }

        @Test
        @DisplayName("Creating a tournament saves schools, debaters, judges, template and notifies everyone")
        void createFull() {
            var dto = tournamentService.createTournament(request(List.of(20L), List.of(10L)), "org");

            assertThat(dto.getId()).isEqualTo(100L);
            verify(tournamentRepository).save(argThat(t -> "Nationals".equals(t.getName())
                    && t.getOrganizer() == organizer));
            verify(schoolDebaterRepository).save(argThat(sd -> sd.getDebater() == debater));
            verify(tournamentJudgeRepository).save(argThat(tj -> "JUDGE-001".equals(tj.getJudgeCode())));
            verify(scoreSheetTemplateRepository).save(any());
            verify(notificationService).send(eq(debater), eq("Tournament Assigned"), anyString());
            verify(notificationService).send(eq(judge), eq("Tournament Judge Assignment"), anyString());
            verify(notificationService).send(eq(organizer), eq("Tournament Created"), anyString());
        }

        @Test
        @DisplayName("Unknown debater id is rejected")
        void unknownDebater() {
            assertThatThrownBy(() -> tournamentService.createTournament(request(List.of(999L), null), "org"))
                    .hasMessageContaining("Debater not found");
        }

        @Test
        @DisplayName("The same debater cannot be placed in two schools of one tournament")
        void duplicateDebater() {
            when(schoolDebaterRepository.findByTournamentAndDebater(any(), eq(debater)))
                    .thenReturn(List.of(SchoolDebater.builder().build()));

            assertThatThrownBy(() -> tournamentService.createTournament(request(List.of(20L), null), "org"))
                    .hasMessageContaining("already assigned");
        }

        @Test
        @DisplayName("Adding a judge generates the next sequential judge code")
        void addJudgeCode() {
            when(tournamentJudgeRepository.countByTournament(tournament)).thenReturn(2L);

            var dto = tournamentService.addJudge(100L, 10L);

            assertThat(dto.getJudgeCode()).isEqualTo("JUDGE-003");
        }

        @Test
        @DisplayName("Adding the same judge twice is rejected")
        void addJudgeTwice() {
            when(tournamentJudgeRepository.existsByTournamentAndJudge(tournament, judge)).thenReturn(true);

            assertThatThrownBy(() -> tournamentService.addJudge(100L, 10L))
                    .hasMessageContaining("already added");
        }

        @Test
        @DisplayName("Looking up a missing tournament reports 'not found'")
        void missingTournament() {
            assertThatThrownBy(() -> tournamentService.getTournamentById(404L))
                    .hasMessage("Tournament not found");
        }
    }

    @Nested
    @DisplayName("MatchService")
    class MatchTests {
        School royal = school(200, "Royal", tournament);
        School trinity = school(201, "Trinity", tournament);

        @BeforeEach
        void schools() {
            when(schoolRepository.findById(200L)).thenReturn(Optional.of(royal));
            when(schoolRepository.findById(201L)).thenReturn(Optional.of(trinity));
        }

        private CreateMatchRequest request(long propId, long oppId) {
            CreateMatchRequest r = new CreateMatchRequest();
            r.setTournamentId(100L);
            r.setPropositionSchoolId(propId);
            r.setOppositionSchoolId(oppId);
            r.setTopic("This house would ban homework");
            r.setJudgeIds(List.of(10L));
            return r;
        }

        @Test
        @DisplayName("A school cannot debate against itself")
        void sameSchool() {
            assertThatThrownBy(() -> matchService.createMatch(request(200, 200)))
                    .hasMessageContaining("cannot be the same");
        }

        @Test
        @DisplayName("Creating a match sets next round number, match code, and notifies judge")
        void createMatch() {
            when(matchRepository.findMaxRoundNumber(tournament)).thenReturn(Optional.of(2));
            when(matchRepository.findByTournament(tournament)).thenReturn(List.of(new Match(), new Match()));
            when(matchRepository.save(any())).thenAnswer(inv -> {
                Match m = inv.getArgument(0);
                m.setId(55L);
                return m;
            });
            when(matchRepository.findById(55L)).thenAnswer(inv -> Optional.of(
                    Match.builder().id(55L).matchCode("MATCH-100-3").tournament(tournament)
                            .propositionSchool(royal).oppositionSchool(trinity).roundNumber(3).build()));

            var dto = matchService.createMatch(request(200, 201));

            assertThat(dto.getMatchCode()).isEqualTo("MATCH-100-3");
            assertThat(dto.getRoundNumber()).isEqualTo(3);
            verify(matchRepository).save(argThat(m -> m.getRoundNumber() == 3));
            verify(matchJudgeRepository).save(argThat(mj -> "/score-sheet/55/10".equals(mj.getScoreSheetLink())));
            verify(notificationService).send(eq(judge), eq("New Judging Assignment"), anyString());
        }

        @Test
        @DisplayName("Next round cannot be generated while matches are unfinished")
        void nextRoundBlockedUntilComplete() {
            when(matchRepository.findMaxRoundNumber(tournament)).thenReturn(Optional.of(1));
            when(matchRepository.findByTournamentAndRound(tournament, 1))
                    .thenReturn(List.of(match(1, tournament, royal, trinity)));

            assertThatThrownBy(() -> matchService.generateNextRound(100L))
                    .hasMessageContaining("Not all matches");
        }

        @Test
        @DisplayName("Next round pairs the winners of the current round")
        void nextRoundPairsWinners() {
            School a = school(1, "A", tournament), b = school(2, "B", tournament);
            Match m1 = match(1, tournament, royal, a);
            Match m2 = match(2, tournament, trinity, b);
            m1.setStatus(Match.Status.COMPLETED);
            m1.setWinnerSchool(royal);
            m2.setStatus(Match.Status.COMPLETED);
            m2.setWinnerSchool(b);
            when(matchRepository.findMaxRoundNumber(tournament)).thenReturn(Optional.of(1));
            when(matchRepository.findByTournamentAndRound(tournament, 1)).thenReturn(List.of(m1, m2));

            matchService.generateNextRound(100L);

            verify(matchRepository).save(argThat(m -> m.getRoundNumber() == 2
                    && m.getPropositionSchool() == royal && m.getOppositionSchool() == b));
        }
    }
}
