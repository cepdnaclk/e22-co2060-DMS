package com.dms.repository;

import com.dms.entity.ForumPoint;
import com.dms.entity.ForumTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumPointRepository extends JpaRepository<ForumPoint, Long> {
    List<ForumPoint> findByTopicOrderByCreatedAtAsc(ForumTopic topic);
    long countByTopic(ForumTopic topic);
}
