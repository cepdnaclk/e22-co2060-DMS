package com.dms.controller;

import com.dms.dto.SearchResultDTO;
import com.dms.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResultDTO> search(@RequestParam String query) {
        return ResponseEntity.ok(searchService.search(query));
    }
}
