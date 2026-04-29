package com.dms.dto;

import com.dms.entity.NewsPost;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NewsPostDTO {
    private Long id;
    private String title;
    private NewsPost.Category category;
    private String content;
    private String imageUrl;
    private String authorName;
    private Long authorId;
    private LocalDateTime createdAt;

    public static NewsPostDTO from(NewsPost p) {
        NewsPostDTO dto = new NewsPostDTO();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setCategory(p.getCategory());
        dto.setContent(p.getContent());
        dto.setImageUrl(p.getImageUrl());
        dto.setCreatedAt(p.getCreatedAt());
        if (p.getAuthor() != null) {
            dto.setAuthorName(p.getAuthor().getFullName());
            dto.setAuthorId(p.getAuthor().getId());
        }
        return dto;
    }
}
