package com.dms.controller;

import com.dms.dto.CreateForumPointRequest;
import com.dms.dto.ForumPointDTO;
import com.dms.dto.ForumTopicDTO;
import com.dms.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/topics")
    public ResponseEntity<List<ForumTopicDTO>> getTopics() {
        return ResponseEntity.ok(forumService.getTopics());
    }

    @PostMapping("/topics/{topicId}/points")
    public ResponseEntity<ForumPointDTO> addPoint(@PathVariable Long topicId,
                                                  @Valid @RequestBody CreateForumPointRequest request) {
        return ResponseEntity.ok(forumService.addPoint(topicId, request));
    }
}
