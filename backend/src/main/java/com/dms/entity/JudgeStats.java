package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "judge_stats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JudgeStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", unique = true, nullable = false)
    private User judge;

    @Builder.Default
    private Integer matchesJudged = 0;
}
