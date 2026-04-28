package com.dms.dto;

import com.dms.entity.MatchJudge;
import lombok.Data;

@Data
public class MatchJudgeDTO {
    private Long id;
    private UserDTO judge;
    private String scoreSheetLink;
    private Boolean submitted;

    public static MatchJudgeDTO from(MatchJudge mj) {
        MatchJudgeDTO dto = new MatchJudgeDTO();
        dto.setId(mj.getId());
        dto.setJudge(UserDTO.from(mj.getJudge()));
        dto.setScoreSheetLink(mj.getScoreSheetLink());
        dto.setSubmitted(mj.getSubmitted());
        return dto;
    }
}
