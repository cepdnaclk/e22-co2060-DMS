package com.dms.dto;

import com.dms.entity.CalendarEvent;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CalendarEventDTO {
    private Long id;
    private String title;
    private String description;
    private CalendarEvent.EventType eventType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean reminderEnabled;
    private String colorCode;

    public static CalendarEventDTO from(CalendarEvent e) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setEventType(e.getEventType());
        dto.setStartTime(e.getStartTime());
        dto.setEndTime(e.getEndTime());
        dto.setReminderEnabled(e.getReminderEnabled());
        dto.setColorCode(e.getColorCode());
        return dto;
    }
}
