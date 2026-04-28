package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "score_sheet_submissions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"match_id", "judge_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScoreSheetSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    @Column(length = 5000)
    private String propositionScoresJson;

    @Column(length = 5000)
    private String oppositionScoresJson;

    private Double propositionTotal;
    private Double oppositionTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_best_speaker_id")
    private User selectedBestSpeaker;

    @Column(length = 2000)
    private String comments;

    @Builder.Default
    private Boolean reopened = false;

    @CreationTimestamp
    private LocalDateTime submittedAt;
}
