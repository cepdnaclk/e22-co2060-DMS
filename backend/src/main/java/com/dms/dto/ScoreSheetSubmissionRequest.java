package com.dms.dto;

import lombok.Data;

@Data
public class ScoreSheetSubmissionRequest {
    private Long matchId;
    private Long judgeId;
    private String propositionScoresJson;
    private String oppositionScoresJson;
    private Double propositionTotal;
    private Double oppositionTotal;
    private Long selectedBestSpeakerId;
    private String comments;
}
