package com.dms.controller;

import com.dms.entity.ScoreSheetSubmission;
import com.dms.entity.ScoreSheetTemplate;
import com.dms.dto.ScoreSheetSubmissionRequest;
import com.dms.service.ScoreSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScoreSheetController {

    private final ScoreSheetService scoreSheetService;

    @PostMapping("/score-templates")
    public ResponseEntity<ScoreSheetTemplate> saveTemplate(@RequestBody Map<String, Object> body) {
        Long tournamentId = Long.parseLong(body.get("tournamentId").toString());
        String name = (String) body.get("name");
        String criteriaJson = (String) body.get("criteriaJson");
        return ResponseEntity.ok(scoreSheetService.saveTemplate(tournamentId, name, criteriaJson));
    }

    @GetMapping("/score-templates/{tournamentId}")
    public ResponseEntity<ScoreSheetTemplate> getTemplate(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(scoreSheetService.getTemplate(tournamentId));
    }

    @GetMapping("/score-sheets/{matchId}/{judgeId}")
    public ResponseEntity<ScoreSheetSubmission> getSubmission(@PathVariable Long matchId,
                                                               @PathVariable Long judgeId) {
        return ResponseEntity.ok(scoreSheetService.getSubmission(matchId, judgeId));
    }

    @PostMapping("/score-sheets/submit")
    public ResponseEntity<ScoreSheetSubmission> submit(@RequestBody ScoreSheetSubmissionRequest req) {
        return ResponseEntity.ok(scoreSheetService.submitScoreSheet(req));
    }

    @PostMapping("/score-sheets/{id}/reopen")
    public ResponseEntity<String> reopen(@PathVariable Long id) {
        scoreSheetService.reopenScoreSheet(id);
        return ResponseEntity.ok("Score sheet reopened");
    }
}
