package com.dms.dto;

import com.dms.entity.ForumPoint;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ForumPointDTO {
    private Long id;
    private Long topicId;
    private String side;
    private String authorName;
    private String role;
    private String colorClass;
    private String content;
    private Long taggedPointId;
    private LocalDateTime createdAt;

    public static ForumPointDTO from(ForumPoint point) {
        ForumPointDTO dto = new ForumPointDTO();
        dto.setId(point.getId());
        dto.setTopicId(point.getTopic().getId());
        dto.setSide(point.getSide().name());
        dto.setAuthorName(point.getAuthorName());
        dto.setRole(point.getRole().name());
        dto.setColorClass(point.getColorClass());
        dto.setContent(point.getContent());
        if (point.getTaggedPoint() != null) dto.setTaggedPointId(point.getTaggedPoint().getId());
        dto.setCreatedAt(point.getCreatedAt());
        return dto;
    }
}
