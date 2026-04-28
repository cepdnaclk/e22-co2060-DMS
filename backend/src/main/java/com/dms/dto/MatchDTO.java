package com.dms.dto;

import com.dms.entity.Match;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class MatchDTO {
    private Long id;
    private String matchCode;
    private Long tournamentId;
    private String tournamentName;
    private SchoolDTO propositionSchool;
    private SchoolDTO oppositionSchool;
    private String topic;
    private Match.Status status;
    private SchoolDTO winnerSchool;
    private UserDTO bestSpeaker;
    private Integer roundNumber;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private List<MatchJudgeDTO> judges;

    public static MatchDTO from(Match m) {
        MatchDTO dto = new MatchDTO();
        dto.setId(m.getId());
        dto.setMatchCode(m.getMatchCode());
        dto.setTournamentId(m.getTournament().getId());
        dto.setTournamentName(m.getTournament().getName());
        dto.setPropositionSchool(SchoolDTO.from(m.getPropositionSchool()));
        dto.setOppositionSchool(SchoolDTO.from(m.getOppositionSchool()));
        dto.setTopic(m.getTopic());
        dto.setStatus(m.getStatus());
        if (m.getWinnerSchool() != null) dto.setWinnerSchool(SchoolDTO.from(m.getWinnerSchool()));
        if (m.getBestSpeaker() != null) dto.setBestSpeaker(UserDTO.from(m.getBestSpeaker()));
        dto.setRoundNumber(m.getRoundNumber());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setStartTime(m.getStartTime());
        if (m.getJudges() != null) {
            dto.setJudges(m.getJudges().stream().map(MatchJudgeDTO::from).collect(Collectors.toList()));
        }
        return dto;
    }
}
