package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/matches")
    public ResponseEntity<MatchDTO> createMatch(@RequestBody CreateMatchRequest req) {
        return ResponseEntity.ok(matchService.createMatch(req));
    }

    @GetMapping("/matches/{id}")
    public ResponseEntity<MatchDTO> getMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatch(id));
    }

    @GetMapping("/tournaments/{id}/matches")
    public ResponseEntity<List<MatchDTO>> getTournamentMatches(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getTournamentMatches(id));
    }

    @PostMapping("/tournaments/{id}/generate-next-round")
    public ResponseEntity<String> generateNextRound(@PathVariable Long id) {
        matchService.generateNextRound(id);
        return ResponseEntity.ok("Next round generated successfully");
    }

    @GetMapping("/matches/live")
    public ResponseEntity<List<MatchDTO>> getLiveMatches() {
        return ResponseEntity.ok(matchService.getLiveMatches());
    }
}
