package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "forum_topics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForumTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String title;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 1000)
    private String summary;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    private List<ForumPoint> points;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
