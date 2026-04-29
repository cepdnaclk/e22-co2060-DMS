package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String username;

    private Integer age;

    @Column(length = 1000)
    private String bio;

    private String location;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profilePictureUrl;

    @Column(length = 1000)
    private String socialLinksJson;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PrivacyStatus privacyStatus = PrivacyStatus.PUBLIC;

    @Builder.Default
    private String language = "en";

    private String expertise;
    private Integer yearsOfExperience;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Role {
        DEBATER, JUDGE, ORGANIZER
    }

    public enum PrivacyStatus {
        PUBLIC, PRIVATE
    }
}
