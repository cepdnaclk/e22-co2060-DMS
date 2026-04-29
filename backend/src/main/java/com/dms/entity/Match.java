package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "matches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String matchCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposition_school_id", nullable = false)
    private School propositionSchool;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opposition_school_id", nullable = false)
    private School oppositionSchool;

    @Column(nullable = false)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.UPCOMING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_school_id")
    private School winnerSchool;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "best_speaker_id")
    private User bestSpeaker;

    @Builder.Default
    private Integer roundNumber = 1;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<MatchJudge> judges;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime startTime;

    public enum Status {
        UPCOMING, LIVE, COMPLETED
    }
}
