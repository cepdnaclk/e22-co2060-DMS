package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.StatsService;
import com.dms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final StatsService statsService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    @GetMapping("/debaters/search")
    public ResponseEntity<List<UserDTO>> searchDebaters(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchDebaters(query));
    }

    @GetMapping("/judges/search")
    public ResponseEntity<List<UserDTO>> searchJudges(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchJudges(query));
    }

    @GetMapping("/top-debaters")
    public ResponseEntity<List<DebaterStatsDTO>> getTopDebaters() {
        return ResponseEntity.ok(statsService.getTopDebaters());
    }

    @GetMapping("/organizers")
    public ResponseEntity<List<UserDTO>> getOrganizers() {
        return ResponseEntity.ok(userService.getOrganizers());
    }
}
