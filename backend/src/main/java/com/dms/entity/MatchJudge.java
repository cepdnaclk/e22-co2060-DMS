package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_judges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatchJudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    private String scoreSheetLink;

    @Builder.Default
    private Boolean submitted = false;
}
