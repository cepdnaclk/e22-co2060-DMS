package com.dms.unit;

import com.dms.entity.*;
import com.dms.repository.*;
import com.dms.service.ConnectionService;
import com.dms.service.DiaryService;
import com.dms.service.NotificationService;
import com.dms.service.StatsService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Unit: Connections, Diaries & Stats")
class SocialServicesTest {

    @Mock ConnectionRepository connectionRepository;
    @Mock BlockRepository blockRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @Mock DiaryPostRepository diaryPostRepository;
    @Mock DiaryCommentRepository diaryCommentRepository;
    @Mock DebaterStatsRepository debaterStatsRepository;
    @Mock JudgeStatsRepository judgeStatsRepository;
    @Mock MatchRepository matchRepository;
    @Mock SchoolRepository schoolRepository;
    @Mock TournamentRepository tournamentRepository;

    @InjectMocks ConnectionService connectionService;
    @InjectMocks DiaryService diaryService;
    @InjectMocks StatsService statsService;

    User alice = user(1, "alice", User.Role.DEBATER);
    User bob = user(2, "bob", User.Role.DEBATER);
    User org = user(3, "org", User.Role.ORGANIZER);

    @BeforeEach
    void users() {
        for (User u : List.of(alice, bob, org)) {
            when(userRepository.findByUsername(u.getUsername())).thenReturn(Optional.of(u));
            when(userRepository.findById(u.getId())).thenReturn(Optional.of(u));
        }
        when(connectionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(blockRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(diaryPostRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Nested
    @DisplayName("ConnectionService")
    class Connections {

        @Test
        @DisplayName("Sending a request creates a PENDING connection and notifies the receiver")
        void sendRequest() {
            var dto = connectionService.sendRequest("alice", 2L);

            assertThat(dto.getStatus()).isEqualTo(Connection.ConnectionStatus.PENDING);
            verify(notificationService).send(eq(bob), eq("New Connection Request"), any());
        }

        @Test
        @DisplayName("Cannot connect with yourself")
        void selfConnect() {
            assertThatThrownBy(() -> connectionService.sendRequest("alice", 1L))
                    .hasMessage("Cannot connect with yourself");
        }

        @Test
        @DisplayName("Blocked users cannot send requests")
        void blocked() {
            when(blockRepository.existsByBlockerAndBlockedOrBlockerAndBlocked(alice, bob, bob, alice)).thenReturn(true);

            assertThatThrownBy(() -> connectionService.sendRequest("alice", 2L)).hasMessage("Action blocked");
        }

        @Test
        @DisplayName("Duplicate request is rejected")
        void duplicate() {
            when(connectionRepository.findConnectionBetween(alice, bob))
                    .thenReturn(Optional.of(Connection.builder().build()));

            assertThatThrownBy(() -> connectionService.sendRequest("alice", 2L))
                    .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("Only the receiver can accept a request")
        void onlyReceiverAccepts() {
            Connection c = Connection.builder().id(9L).requester(alice).receiver(bob)
                    .status(Connection.ConnectionStatus.PENDING).build();
            when(connectionRepository.findById(9L)).thenReturn(Optional.of(c));

            assertThatThrownBy(() -> connectionService.acceptRequest("alice", 9L))
                    .hasMessageContaining("Not authorized");

            connectionService.acceptRequest("bob", 9L);
            assertThat(c.getStatus()).isEqualTo(Connection.ConnectionStatus.ACCEPTED);
        }

        @Test
        @DisplayName("Blocking removes any existing connection")
        void blockRemovesConnection() {
            Connection c = Connection.builder().requester(alice).receiver(bob).build();
            when(connectionRepository.findConnectionBetween(alice, bob)).thenReturn(Optional.of(c));

            connectionService.blockUser("alice", 2L);

            verify(connectionRepository).delete(c);
            verify(blockRepository).save(any(Block.class));
        }

        @Test
        @DisplayName("Connection status reports SELF / NONE / PENDING_SENT / PENDING_RECEIVED / ACCEPTED / BLOCKED")
        void statuses() {
            assertThat(connectionService.getConnectionStatus("alice", 1L)).isEqualTo("SELF");
            assertThat(connectionService.getConnectionStatus("alice", 2L)).isEqualTo("NONE");

            Connection c = Connection.builder().requester(alice).receiver(bob)
                    .status(Connection.ConnectionStatus.PENDING).build();
            when(connectionRepository.findConnectionBetween(any(), any())).thenReturn(Optional.of(c));
            assertThat(connectionService.getConnectionStatus("alice", 2L)).isEqualTo("PENDING_SENT");
            assertThat(connectionService.getConnectionStatus("bob", 1L)).isEqualTo("PENDING_RECEIVED");

            c.setStatus(Connection.ConnectionStatus.ACCEPTED);
            assertThat(connectionService.getConnectionStatus("alice", 2L)).isEqualTo("ACCEPTED");

            when(blockRepository.existsByBlockerAndBlockedOrBlockerAndBlocked(any(), any(), any(), any())).thenReturn(true);
            assertThat(connectionService.getConnectionStatus("alice", 2L)).isEqualTo("BLOCKED");
        }
    }

    @Nested
    @DisplayName("DiaryService")
    class Diaries {
        DiaryPost post;

        @BeforeEach
        void post() {
            post = DiaryPost.builder().id(5L).author(alice).title("My first win").content("...").build();
            when(diaryPostRepository.findById(5L)).thenReturn(Optional.of(post));
        }

        @Test
        @DisplayName("Like toggles on and off")
        void toggleLike() {
            diaryService.toggleLike(5L, "bob");
            assertThat(post.getLikes()).contains(bob);
            diaryService.toggleLike(5L, "bob");
            assertThat(post.getLikes()).doesNotContain(bob);
        }

        @Test
        @DisplayName("Only organizers can verify a diary post")
        void verifyRequiresOrganizer() {
            assertThatThrownBy(() -> diaryService.setVerified(5L, true, "bob"))
                    .hasMessageContaining("Only organizers");

            diaryService.setVerified(5L, true, "org");
            assertThat(post.getIsVerified()).isTrue();
        }

        @Test
        @DisplayName("Another debater cannot delete someone else's post; author and organizer can")
        void deletePermissions() {
            assertThatThrownBy(() -> diaryService.deleteDiaryPost(5L, "bob"))
                    .hasMessageContaining("Unauthorized");

            diaryService.deleteDiaryPost(5L, "alice");
            diaryService.deleteDiaryPost(5L, "org");
            verify(diaryPostRepository, times(2)).delete(post);
        }

        @Test
        @DisplayName("Sharing increments the share counter")
        void share() {
            diaryService.incrementShare(5L, null);
            assertThat(post.getShareCount()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("StatsService")
    class Stats {

        @Test
        @DisplayName("Leaderboard gives 2 points per win and sorts by points")
        void leaderboard() {
            Tournament t = tournament(100, org);
            School a = school(1, "A", t), b = school(2, "B", t), c = school(3, "C", t);
            Match m1 = match(1, t, a, b);
            m1.setStatus(Match.Status.COMPLETED);
            m1.setWinnerSchool(b);
            Match m2 = match(2, t, b, c);
            m2.setStatus(Match.Status.COMPLETED);
            m2.setWinnerSchool(b);
            Match m3 = match(3, t, a, c); // not completed: ignored
            when(tournamentRepository.findById(100L)).thenReturn(Optional.of(t));
            when(schoolRepository.findByTournament(t)).thenReturn(List.of(a, b, c));
            when(matchRepository.findByTournament(t)).thenReturn(List.of(m1, m2, m3));

            var board = statsService.getTournamentLeaderboard(100L);

            assertThat(board.get(0).getSchoolName()).isEqualTo("B");
            assertThat(board.get(0).getPoints()).isEqualTo(4);
            assertThat(board.get(0).getWinRate()).isEqualTo(100.0);
            assertThat(board).filteredOn(e -> e.getSchoolName().equals("A"))
                    .singleElement().satisfies(e -> {
                        assertThat(e.getPlayed()).isEqualTo(1);
                        assertThat(e.getLosses()).isEqualTo(1);
                    });
        }

        @Test
        @DisplayName("Debater with no stats row gets zeroed stats instead of an error")
        void debaterStatsDefault() {
            when(debaterStatsRepository.findByDebater(alice)).thenReturn(Optional.empty());

            var dto = statsService.getDebaterStats(1L);

            assertThat(dto.getMatchesPlayed()).isZero();
            assertThat(dto.getWins()).isZero();
        }
    }
}
