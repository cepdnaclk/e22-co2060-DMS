package com.dms.dto;

import com.dms.entity.DiaryComment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DiaryCommentDTO {
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorName;
    private String authorUsername;
    private String authorProfilePictureUrl;
    private String content;
    private LocalDateTime createdAt;

    public static DiaryCommentDTO from(DiaryComment c) {
        DiaryCommentDTO dto = new DiaryCommentDTO();
        dto.setId(c.getId());
        dto.setPostId(c.getPost().getId());
        dto.setContent(c.getContent());
        dto.setCreatedAt(c.getCreatedAt());
        if (c.getAuthor() != null) {
            dto.setAuthorId(c.getAuthor().getId());
            dto.setAuthorName(c.getAuthor().getFullName());
            dto.setAuthorUsername(c.getAuthor().getUsername());
            dto.setAuthorProfilePictureUrl(c.getAuthor().getProfilePictureUrl());
        }
        return dto;
    }
}
