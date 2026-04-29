package com.dms.controller;

import com.dms.dto.DiscussionCommentDTO;
import com.dms.service.DiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;

    @GetMapping("/tournaments/{id}/discussion")
    public ResponseEntity<List<DiscussionCommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(discussionService.getComments(id));
    }

    @PostMapping("/discussion")
    public ResponseEntity<DiscussionCommentDTO> addComment(@RequestBody Map<String, Object> body,
                                                           Authentication auth) {
        Long tournamentId = Long.parseLong(body.get("tournamentId").toString());
        Long userId = Long.parseLong(body.get("userId").toString());
        String comment = (String) body.get("comment");
        Long parentId = body.get("parentId") != null ? Long.parseLong(body.get("parentId").toString()) : null;
        return ResponseEntity.ok(discussionService.addComment(tournamentId, userId, comment, parentId));
    }

    @DeleteMapping("/discussion/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        discussionService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/discussion/{id}/reply")
    public ResponseEntity<DiscussionCommentDTO> reply(@PathVariable Long id,
                                                      @RequestBody Map<String, Object> body,
                                                      Authentication auth) {
        Long tournamentId = Long.parseLong(body.get("tournamentId").toString());
        Long userId = Long.parseLong(body.get("userId").toString());
        String comment = (String) body.get("comment");
        return ResponseEntity.ok(discussionService.addComment(tournamentId, userId, comment, id));
    }
}
