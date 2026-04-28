package com.dms.repository;

import com.dms.entity.NewsPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewsPostRepository extends JpaRepository<NewsPost, Long> {
    List<NewsPost> findAllByOrderByCreatedAtDesc();
    List<NewsPost> findByCategoryOrderByCreatedAtDesc(NewsPost.Category category);
}
