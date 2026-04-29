package com.dms.dto;

import com.dms.entity.DiscussionComment;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class DiscussionCommentDTO {
    private Long id;
    private Long tournamentId;
    private Long matchId;
    private UserDTO user;
    private String comment;
    private LocalDateTime createdAt;
    private List<DiscussionCommentDTO> replies;

    public static DiscussionCommentDTO from(DiscussionComment c) {
        DiscussionCommentDTO dto = new DiscussionCommentDTO();
        dto.setId(c.getId());
        dto.setTournamentId(c.getTournament().getId());
        if (c.getMatch() != null) dto.setMatchId(c.getMatch().getId());
        dto.setUser(UserDTO.from(c.getUser()));
        dto.setComment(c.getComment());
        dto.setCreatedAt(c.getCreatedAt());
        if (c.getReplies() != null) {
            dto.setReplies(c.getReplies().stream().map(DiscussionCommentDTO::from).collect(Collectors.toList()));
        }
        return dto;
    }
}
