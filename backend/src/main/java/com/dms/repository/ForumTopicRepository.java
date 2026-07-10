package com.dms.repository;

import com.dms.entity.ForumTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ForumTopicRepository extends JpaRepository<ForumTopic, Long> {
    List<ForumTopic> findAllByOrderByCreatedAtAsc();
    Optional<ForumTopic> findByTitle(String title);
}
