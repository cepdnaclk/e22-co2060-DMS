package com.dms.dto;

import com.dms.entity.ForumTopic;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ForumTopicDTO {
    private Long id;
    private String title;
    private String language;
    private String category;
    private String summary;
    private LocalDateTime createdAt;
    private List<ForumPointDTO> points;

    public static ForumTopicDTO from(ForumTopic topic, List<ForumPointDTO> points) {
        ForumTopicDTO dto = new ForumTopicDTO();
        dto.setId(topic.getId());
        dto.setTitle(topic.getTitle());
        dto.setLanguage(topic.getLanguage());
        dto.setCategory(topic.getCategory());
        dto.setSummary(topic.getSummary());
        dto.setCreatedAt(topic.getCreatedAt());
        dto.setPoints(points);
        return dto;
    }
}
