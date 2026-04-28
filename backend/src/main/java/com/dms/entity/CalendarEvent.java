package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Builder.Default
    private Boolean reminderEnabled = false;

    private String colorCode;

    public enum EventType {
        MATCH, TOURNAMENT, JUDGING_ASSIGNMENT, OTHER
    }
}
