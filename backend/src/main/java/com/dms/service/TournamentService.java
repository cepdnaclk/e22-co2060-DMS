package com.dms.service;

import com.dms.dto.*;
import com.dms.entity.*;
import com.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolDebaterRepository schoolDebaterRepository;
    private final TournamentJudgeRepository tournamentJudgeRepository;
    private final ScoreSheetTemplateRepository scoreSheetTemplateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public TournamentDTO createTournament(CreateTournamentRequest req, String organizerUsername) {
        User organizer = userRepository.findByUsername(organizerUsername)
            .orElseThrow(() -> new RuntimeException("Organizer not found"));

        Tournament tournament = Tournament.builder()
            .name(req.getName())
            .debateType(req.getDebateType())
            .customDebateType(req.getCustomDebateType())
            .tournamentType(req.getTournamentType())
            .organizer(organizer)
            .numberOfLeagues(req.getNumberOfLeagues())
            .build();

        tournament = tournamentRepository.save(tournament);

        // Add schools and debaters
        if (req.getSchools() != null) {
            for (CreateTournamentRequest.SchoolInput si : req.getSchools()) {
                School school = School.builder()
                    .name(si.getName())
                    .tournament(tournament)
                    .build();
                school = schoolRepository.save(school);

                if (si.getDebaterIds() != null) {
                    for (Long debaterId : si.getDebaterIds()) {
                        User debater = userRepository.findById(debaterId)
                            .orElseThrow(() -> new RuntimeException("Debater not found: " + debaterId));
                        // Prevent duplicate in same tournament
                        if (!schoolDebaterRepository.findByTournamentAndDebater(tournament, debater).isEmpty()) {
                            throw new RuntimeException("This debater is already assigned to a school");
                        }
                        schoolDebaterRepository.save(SchoolDebater.builder()
                            .school(school).debater(debater).build());
                    }
                }
            }
        }

        // Add judges
        if (req.getJudgeIds() != null) {
            int count = 1;
            for (Long judgeId : req.getJudgeIds()) {
                User judge = userRepository.findById(judgeId)
                    .orElseThrow(() -> new RuntimeException("Judge not found: " + judgeId));
                String judgeCode = String.format("JUDGE-%03d", count++);
                tournamentJudgeRepository.save(TournamentJudge.builder()
                    .tournament(tournament).judge(judge).judgeCode(judgeCode).build());
            }
        }

        // Save score sheet template
        if (req.getScoreTemplate() != null) {
            scoreSheetTemplateRepository.save(ScoreSheetTemplate.builder()
                .tournament(tournament)
                .name(req.getScoreTemplate().getName())
                .criteriaJson(req.getScoreTemplate().getCriteriaJson())
                .build());
        }

        notificationService.send(organizer,
            "Tournament Created",
            "Your tournament '" + tournament.getName() + "' has been created successfully!");

        return getTournamentById(tournament.getId());
    }

    public List<TournamentDTO> getAllTournaments() {
        return tournamentRepository.findAll().stream()
            .map(this::toFullDTO).collect(Collectors.toList());
    }

    public List<TournamentDTO> getByOrganizer(Long organizerId) {
        User organizer = userRepository.findById(organizerId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return tournamentRepository.findByOrganizer(organizer).stream()
            .map(this::toFullDTO).collect(Collectors.toList());
    }

    public TournamentDTO getTournamentById(Long id) {
        Tournament t = tournamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return toFullDTO(t);
    }

    @Transactional
    public TournamentDTO updateStatus(Long id, Tournament.Status status) {
        Tournament t = tournamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        t.setStatus(status);
        return TournamentDTO.from(tournamentRepository.save(t));
    }

    @Transactional
    public void deleteTournament(Long id) {
        tournamentRepository.deleteById(id);
    }

    public List<TournamentDTO> getActiveTournaments() {
        return tournamentRepository.findActiveTournaments().stream()
            .map(TournamentDTO::from).collect(Collectors.toList());
    }

    private TournamentDTO toFullDTO(Tournament t) {
        TournamentDTO dto = TournamentDTO.from(t);
        List<School> schools = schoolRepository.findByTournament(t);
        dto.setSchools(schools.stream().map(SchoolDTO::from).collect(Collectors.toList()));
        List<TournamentJudge> judges = tournamentJudgeRepository.findByTournament(t);
        dto.setJudges(judges.stream().map(TournamentJudgeDTO::from).collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public TournamentJudgeDTO addJudge(Long tournamentId, Long judgeId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        User judge = userRepository.findById(judgeId)
            .orElseThrow(() -> new RuntimeException("Judge not found"));

        if (tournamentJudgeRepository.existsByTournamentAndJudge(tournament, judge)) {
            throw new RuntimeException("Judge already added to this tournament");
        }

        long count = tournamentJudgeRepository.countByTournament(tournament);
        String judgeCode = String.format("JUDGE-%03d", count + 1);

        TournamentJudge tj = tournamentJudgeRepository.save(
            TournamentJudge.builder().tournament(tournament).judge(judge).judgeCode(judgeCode).build());
        return TournamentJudgeDTO.from(tj);
    }

    public List<TournamentJudgeDTO> getJudges(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return tournamentJudgeRepository.findByTournament(tournament)
            .stream().map(TournamentJudgeDTO::from).collect(Collectors.toList());
    }
}
