package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_debaters",
       uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "debater_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SchoolDebater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debater_id", nullable = false)
    private User debater;
}
