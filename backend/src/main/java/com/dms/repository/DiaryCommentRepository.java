package com.dms.repository;

import com.dms.entity.DiaryComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryCommentRepository extends JpaRepository<DiaryComment, Long> {
}
