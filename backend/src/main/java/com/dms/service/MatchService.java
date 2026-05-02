package com.dms.service;

import com.dms.dto.*;
import com.dms.entity.*;
import com.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchJudgeRepository matchJudgeRepository;
    private final TournamentRepository tournamentRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SchoolDebaterRepository schoolDebaterRepository;

    @Transactional
    public MatchDTO createMatch(CreateMatchRequest req) {
        Tournament tournament = tournamentRepository.findById(req.getTournamentId())
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        School prop = schoolRepository.findById(req.getPropositionSchoolId())
            .orElseThrow(() -> new RuntimeException("School not found"));
        School opp = schoolRepository.findById(req.getOppositionSchoolId())
            .orElseThrow(() -> new RuntimeException("School not found"));

        if (prop.getId().equals(opp.getId())) {
            throw new RuntimeException("Proposition and opposition schools cannot be the same");
        }

        Integer maxRound = matchRepository.findMaxRoundNumber(tournament).orElse(0);
        String matchCode = "MATCH-" + tournament.getId() + "-" + (matchRepository.findByTournament(tournament).size() + 1);

        Match match = Match.builder()
            .matchCode(matchCode)
            .tournament(tournament)
            .propositionSchool(prop)
            .oppositionSchool(opp)
            .topic(req.getTopic())
            .roundNumber(maxRound + 1)
            .startTime(req.getStartTime())
            .build();

        match = matchRepository.save(match);

        // Assign judges
        if (req.getJudgeIds() != null) {
            for (Long judgeId : req.getJudgeIds()) {
                User judge = userRepository.findById(judgeId)
                    .orElseThrow(() -> new RuntimeException("Judge not found"));
                String link = "/score-sheet/" + match.getId() + "/" + judgeId;
                matchJudgeRepository.save(MatchJudge.builder()
                    .match(match).judge(judge).scoreSheetLink(link).build());

                notificationService.send(judge,
                    "New Judging Assignment",
                    "You have been assigned as a judge for " + matchCode + " in " +
                    tournament.getName() + " organised by " + tournament.getOrganizer().getFullName() + ".",
                    link);
            }
        }

        // Notify debaters
        List<SchoolDebater> propDebaters = schoolDebaterRepository.findBySchool(prop);
        List<SchoolDebater> oppDebaters = schoolDebaterRepository.findBySchool(opp);
        String debaterMsg = "Your school has been assigned to " + matchCode + " in " +
            tournament.getName() + ". Topic: " + req.getTopic() + ".";

        for (SchoolDebater sd : propDebaters) {
            notificationService.send(sd.getDebater(), "Match Assigned", debaterMsg);
        }
        for (SchoolDebater sd : oppDebaters) {
            notificationService.send(sd.getDebater(), "Match Assigned", debaterMsg);
        }

        return MatchDTO.from(matchRepository.findById(match.getId()).orElseThrow());
    }

    public List<MatchDTO> getTournamentMatches(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return matchRepository.findByTournamentOrderByRoundNumberAscCreatedAtAsc(tournament)
            .stream().map(MatchDTO::from).collect(Collectors.toList());
    }

    public MatchDTO getMatch(Long id) {
        return MatchDTO.from(matchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Match not found")));
    }

    public List<MatchDTO> getLiveMatches() {
        return matchRepository.findByStatus(Match.Status.LIVE)
            .stream().map(MatchDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public MatchDTO generateNextRound(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));

        Integer currentRound = matchRepository.findMaxRoundNumber(tournament).orElse(1);
        List<Match> currentRoundMatches = matchRepository.findByTournamentAndRound(tournament, currentRound);

        boolean allCompleted = currentRoundMatches.stream()
            .allMatch(m -> m.getStatus() == Match.Status.COMPLETED);
        if (!allCompleted) {
            throw new RuntimeException("Not all matches in current round are completed");
        }

        List<School> winners = currentRoundMatches.stream()
            .map(Match::getWinnerSchool)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        if (winners.size() < 2) {
            throw new RuntimeException("Not enough winners to generate next round");
        }

        // Pair winners for next round
        for (int i = 0; i + 1 < winners.size(); i += 2) {
            String matchCode = "MATCH-" + tournament.getId() + "-R" + (currentRound + 1) + "-" + (i/2 + 1);
            Match nextMatch = Match.builder()
                .matchCode(matchCode)
                .tournament(tournament)
                .propositionSchool(winners.get(i))
                .oppositionSchool(winners.get(i + 1))
                .topic("TBD")
                .roundNumber(currentRound + 1)
                .build();
            matchRepository.save(nextMatch);
        }

        return null;
    }
}
