package com.dms.dto;

import com.dms.entity.DiaryPost;
import com.dms.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class DiaryPostDTO {
    private Long id;
    private Long authorId;
    private String authorName;
    private String authorUsername;
    private String authorProfilePictureUrl;
    private String authorRole;
    private String title;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private Integer likesCount;
    private Boolean isLikedByCurrentUser;
    private List<DiaryCommentDTO> comments = new ArrayList<>();
    private Integer shareCount;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    public static DiaryPostDTO from(DiaryPost p, User currentUser) {
        DiaryPostDTO dto = new DiaryPostDTO();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setContent(p.getContent());
        dto.setImageUrl(p.getImageUrl());
        dto.setVideoUrl(p.getVideoUrl());
        dto.setShareCount(p.getShareCount());
        dto.setIsVerified(p.getIsVerified());
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getAuthor() != null) {
            dto.setAuthorId(p.getAuthor().getId());
            dto.setAuthorName(p.getAuthor().getFullName());
            dto.setAuthorUsername(p.getAuthor().getUsername());
            dto.setAuthorProfilePictureUrl(p.getAuthor().getProfilePictureUrl());
            dto.setAuthorRole(p.getAuthor().getRole().toString());
        }

        int likes = p.getLikes() != null ? p.getLikes().size() : 0;
        dto.setLikesCount(likes);

        boolean liked = currentUser != null && p.getLikes() != null && p.getLikes().contains(currentUser);
        dto.setIsLikedByCurrentUser(liked);

        if (p.getComments() != null) {
            dto.setComments(p.getComments().stream()
                .map(DiaryCommentDTO::from)
                .collect(Collectors.toList()));
        }

        return dto;
    }
}
