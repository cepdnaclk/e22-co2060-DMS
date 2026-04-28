package com.dms.service;

import com.dms.dto.*;
import com.dms.entity.*;
import com.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreSheetService {

    private final ScoreSheetSubmissionRepository submissionRepository;
    private final ScoreSheetTemplateRepository templateRepository;
    private final MatchRepository matchRepository;
    private final MatchJudgeRepository matchJudgeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DebaterStatsRepository debaterStatsRepository;
    private final JudgeStatsRepository judgeStatsRepository;
    private final SchoolDebaterRepository schoolDebaterRepository;
    private final TournamentRepository tournamentRepository;

    public ScoreSheetTemplate getTemplate(Long tournamentId) {
        Tournament t = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return templateRepository.findTopByTournamentOrderByCreatedAtDesc(t)
            .orElse(null);
    }

    @Transactional
    public ScoreSheetTemplate saveTemplate(Long tournamentId, String name, String criteriaJson) {
        Tournament t = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        ScoreSheetTemplate tmpl = ScoreSheetTemplate.builder()
            .tournament(t).name(name).criteriaJson(criteriaJson).build();
        return templateRepository.save(tmpl);
    }

    public ScoreSheetSubmission getSubmission(Long matchId, Long judgeId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        User judge = userRepository.findById(judgeId)
            .orElseThrow(() -> new RuntimeException("Judge not found"));
        return submissionRepository.findByMatchAndJudge(match, judge).orElse(null);
    }

    @Transactional
    public ScoreSheetSubmission submitScoreSheet(ScoreSheetSubmissionRequest req) {
        Match match = matchRepository.findById(req.getMatchId())
            .orElseThrow(() -> new RuntimeException("Match not found"));
        User judge = userRepository.findById(req.getJudgeId())
            .orElseThrow(() -> new RuntimeException("Judge not found"));

        if (submissionRepository.existsByMatchAndJudge(match, judge)) {
            throw new RuntimeException("This judge has already submitted scores");
        }

        User bestSpeaker = null;
        if (req.getSelectedBestSpeakerId() != null) {
            bestSpeaker = userRepository.findById(req.getSelectedBestSpeakerId()).orElse(null);
        }

        ScoreSheetSubmission submission = ScoreSheetSubmission.builder()
            .match(match)
            .judge(judge)
            .propositionScoresJson(req.getPropositionScoresJson())
            .oppositionScoresJson(req.getOppositionScoresJson())
            .propositionTotal(req.getPropositionTotal())
            .oppositionTotal(req.getOppositionTotal())
            .selectedBestSpeaker(bestSpeaker)
            .comments(req.getComments())
            .build();

        submission = submissionRepository.save(submission);

        // Mark match judge as submitted
        matchJudgeRepository.findByMatchAndJudge(match, judge).ifPresent(mj -> {
            mj.setSubmitted(true);
            matchJudgeRepository.save(mj);
        });

        // Update judge stats
        judgeStatsRepository.findByJudge(judge).ifPresent(js -> {
            js.setMatchesJudged(js.getMatchesJudged() + 1);
            judgeStatsRepository.save(js);
        });

        // Notify organizer
        notificationService.send(match.getTournament().getOrganizer(),
            "Score Sheet Submitted",
            judge.getFullName() + " submitted scores for " + match.getMatchCode());

        // Check if all judges submitted
        List<MatchJudge> judges = matchJudgeRepository.findByMatch(match);
        boolean allSubmitted = judges.stream().allMatch(MatchJudge::getSubmitted);

        if (allSubmitted && !judges.isEmpty()) {
            completeMatch(match);
        }

        return submission;
    }

    private void completeMatch(Match match) {
        List<ScoreSheetSubmission> submissions = submissionRepository.findByMatch(match);

        double avgProp = submissions.stream()
            .mapToDouble(s -> s.getPropositionTotal() != null ? s.getPropositionTotal() : 0)
            .average().orElse(0);
        double avgOpp = submissions.stream()
            .mapToDouble(s -> s.getOppositionTotal() != null ? s.getOppositionTotal() : 0)
            .average().orElse(0);

        School winner = avgProp >= avgOpp
            ? match.getPropositionSchool() : match.getOppositionSchool();

        // Determine best speaker by votes
        Map<Long, Long> voteCount = submissions.stream()
            .filter(s -> s.getSelectedBestSpeaker() != null)
            .collect(Collectors.groupingBy(
                s -> s.getSelectedBestSpeaker().getId(),
                Collectors.counting()
            ));
        User bestSpeaker = voteCount.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .flatMap(e -> userRepository.findById(e.getKey()))
            .orElse(null);

        match.setWinnerSchool(winner);
        match.setBestSpeaker(bestSpeaker);
        match.setStatus(Match.Status.COMPLETED);
        matchRepository.save(match);

        // Update debater stats
        List<SchoolDebater> propDebaters = schoolDebaterRepository.findBySchool(match.getPropositionSchool());
        List<SchoolDebater> oppDebaters = schoolDebaterRepository.findBySchool(match.getOppositionSchool());

        for (SchoolDebater sd : propDebaters) {
            updateDebaterStats(sd.getDebater(), winner.equals(match.getPropositionSchool()),
                sd.getDebater().equals(bestSpeaker));
        }
        for (SchoolDebater sd : oppDebaters) {
            updateDebaterStats(sd.getDebater(), winner.equals(match.getOppositionSchool()),
                sd.getDebater().equals(bestSpeaker));
        }

        // Notify organizer
        notificationService.send(match.getTournament().getOrganizer(),
            "Match Completed",
            match.getMatchCode() + " completed. Winner: " + winner.getName());
    }

    private void updateDebaterStats(User debater, boolean won, boolean isBestSpeaker) {
        DebaterStats stats = debaterStatsRepository.findByDebater(debater)
            .orElse(DebaterStats.builder().debater(debater).build());
        stats.setMatchesPlayed(stats.getMatchesPlayed() + 1);
        if (won) stats.setWins(stats.getWins() + 1);
        else stats.setLosses(stats.getLosses() + 1);
        if (isBestSpeaker) stats.setPlayerOfMatchCount(stats.getPlayerOfMatchCount() + 1);
        debaterStatsRepository.save(stats);
    }

    @Transactional
    public void reopenScoreSheet(Long submissionId) {
        ScoreSheetSubmission sub = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        sub.setReopened(true);
        submissionRepository.save(sub);

        matchJudgeRepository.findByMatchAndJudge(sub.getMatch(), sub.getJudge()).ifPresent(mj -> {
            mj.setSubmitted(false);
            matchJudgeRepository.save(mj);
        });
    }
}
