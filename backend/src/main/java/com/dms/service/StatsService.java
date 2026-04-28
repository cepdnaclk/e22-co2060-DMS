package com.dms.service;

import com.dms.dto.DebaterStatsDTO;
import com.dms.entity.*;
import com.dms.repository.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final DebaterStatsRepository debaterStatsRepository;
    private final JudgeStatsRepository judgeStatsRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final SchoolRepository schoolRepository;
    private final TournamentRepository tournamentRepository;

    public DebaterStatsDTO getDebaterStats(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        DebaterStats stats = debaterStatsRepository.findByDebater(user)
            .orElse(DebaterStats.builder().debater(user).matchesPlayed(0).wins(0).losses(0).playerOfMatchCount(0).build());
        return DebaterStatsDTO.from(stats);
    }

    public Map<String, Object> getJudgeStats(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        JudgeStats stats = judgeStatsRepository.findByJudge(user)
            .orElse(JudgeStats.builder().judge(user).matchesJudged(0).build());
        Map<String, Object> result = new HashMap<>();
        result.put("judgeId", id);
        result.put("matchesJudged", stats.getMatchesJudged());
        return result;
    }

    public List<DebaterStatsDTO> getTopDebaters() {
        return debaterStatsRepository.findTopDebaters().stream()
            .limit(10)
            .map(DebaterStatsDTO::from)
            .collect(Collectors.toList());
    }

    public List<SchoolLeaderboardEntry> getTournamentLeaderboard(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        List<School> schools = schoolRepository.findByTournament(tournament);
        List<Match> matches = matchRepository.findByTournament(tournament);

        Map<Long, SchoolLeaderboardEntry> leaderboard = new LinkedHashMap<>();
        for (School school : schools) {
            leaderboard.put(school.getId(), new SchoolLeaderboardEntry(
                school.getId(), school.getName(), 0, 0, 0, 0, 0.0));
        }

        for (Match match : matches) {
            if (match.getStatus() != Match.Status.COMPLETED) continue;
            Long propId = match.getPropositionSchool().getId();
            Long oppId = match.getOppositionSchool().getId();

            leaderboard.computeIfPresent(propId, (k, e) -> {
                e.setPlayed(e.getPlayed() + 1);
                if (match.getWinnerSchool() != null && match.getWinnerSchool().getId().equals(propId))
                    e.setWins(e.getWins() + 1);
                else e.setLosses(e.getLosses() + 1);
                e.setPoints(e.getWins() * 2);
                e.setWinRate(e.getPlayed() > 0 ? (double) e.getWins() / e.getPlayed() * 100 : 0);
                return e;
            });
            leaderboard.computeIfPresent(oppId, (k, e) -> {
                e.setPlayed(e.getPlayed() + 1);
                if (match.getWinnerSchool() != null && match.getWinnerSchool().getId().equals(oppId))
                    e.setWins(e.getWins() + 1);
                else e.setLosses(e.getLosses() + 1);
                e.setPoints(e.getWins() * 2);
                e.setWinRate(e.getPlayed() > 0 ? (double) e.getWins() / e.getPlayed() * 100 : 0);
                return e;
            });
        }

        return leaderboard.values().stream()
            .sorted(Comparator.comparingInt(SchoolLeaderboardEntry::getPoints).reversed())
            .collect(Collectors.toList());
    }

    @Data @AllArgsConstructor
    public static class SchoolLeaderboardEntry {
        private Long schoolId;
        private String schoolName;
        private int played;
        private int wins;
        private int losses;
        private int points;
        private double winRate;
    }
}
