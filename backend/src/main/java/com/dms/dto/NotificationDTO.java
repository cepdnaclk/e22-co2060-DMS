package com.dms.dto;

import com.dms.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private Boolean readStatus;
    private LocalDateTime createdAt;

    public static NotificationDTO from(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setReadStatus(n.getReadStatus());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
