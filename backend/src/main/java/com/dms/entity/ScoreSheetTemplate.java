package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "score_sheet_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScoreSheetTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    private String name;

    @Column(length = 5000)
    private String criteriaJson;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
