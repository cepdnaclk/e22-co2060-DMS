package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @PostMapping
    public ResponseEntity<TournamentDTO> create(@RequestBody CreateTournamentRequest req,
                                                Authentication auth) {
        return ResponseEntity.ok(tournamentService.createTournament(req, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TournamentDTO>> getAll() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournamentById(id));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<TournamentDTO>> getByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(tournamentService.getByOrganizer(organizerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/judges")
    public ResponseEntity<TournamentJudgeDTO> addJudge(@PathVariable Long id,
                                                       @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(tournamentService.addJudge(id, body.get("judgeId")));
    }

    @GetMapping("/{id}/judges")
    public ResponseEntity<List<TournamentJudgeDTO>> getJudges(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getJudges(id));
    }
}
