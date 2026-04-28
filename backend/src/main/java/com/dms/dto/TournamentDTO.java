package com.dms.dto;

import com.dms.entity.Tournament;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TournamentDTO {
    private Long id;
    private String name;
    private Tournament.DebateType debateType;
    private String customDebateType;
    private Tournament.TournamentType tournamentType;
    private UserDTO organizer;
    private Tournament.Status status;
    private Integer numberOfLeagues;
    private LocalDateTime createdAt;
    private List<SchoolDTO> schools;
    private List<TournamentJudgeDTO> judges;

    public static TournamentDTO from(Tournament t) {
        TournamentDTO dto = new TournamentDTO();
        dto.setId(t.getId());
        dto.setName(t.getName());
        dto.setDebateType(t.getDebateType());
        dto.setCustomDebateType(t.getCustomDebateType());
        dto.setTournamentType(t.getTournamentType());
        dto.setOrganizer(UserDTO.from(t.getOrganizer()));
        dto.setStatus(t.getStatus());
        dto.setNumberOfLeagues(t.getNumberOfLeagues());
        dto.setCreatedAt(t.getCreatedAt());
        return dto;
    }
}
