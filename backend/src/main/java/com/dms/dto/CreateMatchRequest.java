package com.dms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateMatchRequest {
    private Long tournamentId;
    private Long propositionSchoolId;
    private Long oppositionSchoolId;
    private String topic;
    private List<Long> judgeIds;
    private LocalDateTime startTime;
}
