package com.dms.dto;

import com.dms.entity.School;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class SchoolDTO {
    private Long id;
    private String name;
    private Long tournamentId;
    private List<UserDTO> debaters;

    public static SchoolDTO from(School s) {
        SchoolDTO dto = new SchoolDTO();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setTournamentId(s.getTournament().getId());
        if (s.getDebaters() != null) {
            dto.setDebaters(s.getDebaters().stream()
                .map(sd -> UserDTO.from(sd.getDebater()))
                .collect(Collectors.toList()));
        }
        return dto;
    }
}
