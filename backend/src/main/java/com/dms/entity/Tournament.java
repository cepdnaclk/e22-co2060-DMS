package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tournaments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private DebateType debateType;

    private String customDebateType;

    @Enumerated(EnumType.STRING)
    private TournamentType tournamentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    private Integer numberOfLeagues;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<School> schools;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<TournamentJudge> judges;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Match> matches;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum DebateType {
        TRADITIONAL, ASIAN_PARLIAMENTARY, BRITISH_PARLIAMENTARY,
        SULALUM_SOTPOR, VAZHAKAADU_MANDRAM, OTHER
    }

    public enum TournamentType {
        LEAGUE, KNOCKOUT
    }

    public enum Status {
        ACTIVE, COMPLETED, CANCELLED
    }
}
