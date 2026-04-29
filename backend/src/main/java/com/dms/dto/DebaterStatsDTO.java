package com.dms.dto;

import com.dms.entity.DebaterStats;
import lombok.Data;

@Data
public class DebaterStatsDTO {
    private Long debaterId;
    private String fullName;
    private String username;
    private String profilePictureUrl;
    private Integer matchesPlayed;
    private Integer wins;
    private Integer losses;
    private Integer playerOfMatchCount;
    private Integer bestDebaterTournamentCount;
    private Double winRate;

    public static DebaterStatsDTO from(DebaterStats ds) {
        DebaterStatsDTO dto = new DebaterStatsDTO();
        dto.setDebaterId(ds.getDebater().getId());
        dto.setFullName(ds.getDebater().getFullName());
        dto.setUsername(ds.getDebater().getUsername());
        dto.setProfilePictureUrl(ds.getDebater().getProfilePictureUrl());
        dto.setMatchesPlayed(ds.getMatchesPlayed());
        dto.setWins(ds.getWins());
        dto.setLosses(ds.getLosses());
        dto.setPlayerOfMatchCount(ds.getPlayerOfMatchCount());
        dto.setBestDebaterTournamentCount(ds.getBestDebaterTournamentCount());
        dto.setWinRate(ds.getMatchesPlayed() > 0
            ? (double) ds.getWins() / ds.getMatchesPlayed() * 100 : 0.0);
        return dto;
    }
}
