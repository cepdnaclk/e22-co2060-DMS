package com.dms.dto;

import com.dms.entity.TournamentJudge;
import lombok.Data;

@Data
public class TournamentJudgeDTO {
    private Long id;
    private UserDTO judge;
    private String judgeCode;

    public static TournamentJudgeDTO from(TournamentJudge tj) {
        TournamentJudgeDTO dto = new TournamentJudgeDTO();
        dto.setId(tj.getId());
        dto.setJudge(UserDTO.from(tj.getJudge()));
        dto.setJudgeCode(tj.getJudgeCode());
        return dto;
    }
}
