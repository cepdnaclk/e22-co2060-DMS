package com.dms.repository;

import com.dms.entity.DiaryPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryPostRepository extends JpaRepository<DiaryPost, Long> {
    List<DiaryPost> findAllByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
