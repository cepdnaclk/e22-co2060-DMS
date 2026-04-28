package com.dms.dto;

import com.dms.entity.Tournament;
import lombok.Data;

import java.util.List;

@Data
public class CreateTournamentRequest {
    private String name;
    private Tournament.DebateType debateType;
    private String customDebateType;
    private Tournament.TournamentType tournamentType;
    private Integer numberOfLeagues;
    private List<SchoolInput> schools;
    private List<Long> judgeIds;
    private ScoreTemplateInput scoreTemplate;

    @Data
    public static class SchoolInput {
        private String name;
        private List<Long> debaterIds;
    }

    @Data
    public static class ScoreTemplateInput {
        private String name;
        private String criteriaJson;
    }
}
