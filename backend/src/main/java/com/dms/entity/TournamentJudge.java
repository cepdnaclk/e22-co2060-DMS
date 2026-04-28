package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournament_judges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TournamentJudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    private String judgeCode;
}
