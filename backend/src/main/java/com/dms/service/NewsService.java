package com.dms.service;

import com.dms.dto.NewsPostDTO;
import com.dms.entity.NewsPost;
import com.dms.entity.User;
import com.dms.repository.NewsPostRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsPostRepository newsPostRepository;
    private final UserRepository userRepository;

    public List<NewsPostDTO> getAllNews() {
        return newsPostRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(NewsPostDTO::from).collect(Collectors.toList());
    }

    public NewsPostDTO createPost(NewsPostDTO req, String username) {
        User author = userRepository.findByUsername(username).orElse(null);
        NewsPost post = NewsPost.builder()
            .title(req.getTitle())
            .category(req.getCategory())
            .content(req.getContent())
            .imageUrl(req.getImageUrl())
            .author(author)
            .build();
        return NewsPostDTO.from(newsPostRepository.save(post));
    }
}
