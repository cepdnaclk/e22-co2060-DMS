package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "diary_posts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiaryPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    private String title;

    @Column(nullable = false, length = 10000)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String videoUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "diary_post_likes",
        joinColumns = @JoinColumn(name = "diary_post_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> likes = new HashSet<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DiaryComment> comments = new ArrayList<>();

    @Builder.Default
    private Integer shareCount = 0;

    @Builder.Default
    private Boolean isVerified = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
