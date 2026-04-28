package com.dms.controller;

import com.dms.dto.NewsPostDTO;
import com.dms.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public ResponseEntity<List<NewsPostDTO>> getAll() {
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @PostMapping
    public ResponseEntity<NewsPostDTO> create(@RequestBody NewsPostDTO req, Authentication auth) {
        return ResponseEntity.ok(newsService.createPost(req, auth.getName()));
    }
}
