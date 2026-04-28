package com.dms.controller;

import com.dms.dto.DebaterStatsDTO;
import com.dms.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/stats/debater/{id}")
    public ResponseEntity<DebaterStatsDTO> getDebaterStats(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getDebaterStats(id));
    }

    @GetMapping("/stats/judge/{id}")
    public ResponseEntity<Map<String, Object>> getJudgeStats(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getJudgeStats(id));
    }

    @GetMapping("/tournaments/{id}/leaderboard")
    public ResponseEntity<List<StatsService.SchoolLeaderboardEntry>> getLeaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getTournamentLeaderboard(id));
    }
}
