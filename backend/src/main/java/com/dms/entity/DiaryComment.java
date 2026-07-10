package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "diary_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiaryComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_post_id", nullable = false)
    private DiaryPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 2000)
    private String content;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
