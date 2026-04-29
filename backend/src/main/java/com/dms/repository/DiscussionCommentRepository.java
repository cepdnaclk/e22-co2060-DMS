package com.dms.repository;

import com.dms.entity.DiscussionComment;
import com.dms.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionCommentRepository extends JpaRepository<DiscussionComment, Long> {
    List<DiscussionComment> findByTournamentAndParentCommentIsNullOrderByCreatedAtDesc(Tournament tournament);
}
