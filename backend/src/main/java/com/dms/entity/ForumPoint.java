package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "forum_points")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForumPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private ForumTopic topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Side side;

    @Column(nullable = false, length = 120)
    private String authorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false, length = 120)
    private String colorClass;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tagged_point_id")
    private ForumPoint taggedPoint;

    @OneToMany(mappedBy = "taggedPoint")
    private List<ForumPoint> replies;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Side {
        PROPOSITION, OPPOSITION
    }

    public enum Role {
        DEBATER, ORGANIZER, JUDGE
    }
}
