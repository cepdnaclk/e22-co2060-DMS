package com.dms.controller;

import com.dms.dto.DiaryCommentDTO;
import com.dms.dto.DiaryPostDTO;
import com.dms.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiaryPostDTO>> getByUserId(@PathVariable Long userId, Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(diaryService.getDiariesByUserId(userId, currentUsername));
    }

    @PostMapping
    public ResponseEntity<DiaryPostDTO> create(@RequestBody DiaryPostDTO req, Authentication auth) {
        return ResponseEntity.ok(diaryService.createDiaryPost(req, auth.getName()));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<DiaryPostDTO> like(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(diaryService.toggleLike(id, auth.getName()));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<DiaryCommentDTO> comment(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        String commentText = body.get("comment");
        return ResponseEntity.ok(diaryService.addComment(id, commentText, auth.getName()));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<DiaryPostDTO> share(@PathVariable Long id, Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(diaryService.incrementShare(id, currentUsername));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<DiaryPostDTO> verify(@PathVariable Long id, @RequestParam boolean verified, Authentication auth) {
        return ResponseEntity.ok(diaryService.setVerified(id, verified, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        diaryService.deleteDiaryPost(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}
