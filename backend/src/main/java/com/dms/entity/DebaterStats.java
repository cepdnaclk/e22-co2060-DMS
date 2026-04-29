package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "debater_stats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DebaterStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debater_id", unique = true, nullable = false)
    private User debater;

    @Builder.Default
    private Integer matchesPlayed = 0;

    @Builder.Default
    private Integer wins = 0;

    @Builder.Default
    private Integer losses = 0;

    @Builder.Default
    private Integer playerOfMatchCount = 0;

    @Builder.Default
    private Integer bestDebaterTournamentCount = 0;
}
