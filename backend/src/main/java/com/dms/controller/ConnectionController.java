package com.dms.controller;

import com.dms.dto.BlockDTO;
import com.dms.dto.ConnectionDTO;
import com.dms.dto.UserDTO;
import com.dms.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/request/{userId}")
    public ResponseEntity<ConnectionDTO> sendRequest(@PathVariable Long userId, Principal principal) {
        return ResponseEntity.ok(connectionService.sendRequest(principal.getName(), userId));
    }

    @PutMapping("/accept/{connectionId}")
    public ResponseEntity<ConnectionDTO> acceptRequest(@PathVariable Long connectionId, Principal principal) {
        return ResponseEntity.ok(connectionService.acceptRequest(principal.getName(), connectionId));
    }

    @DeleteMapping("/reject/{connectionId}")
    public ResponseEntity<?> rejectRequest(@PathVariable Long connectionId, Principal principal) {
        connectionService.rejectRequest(principal.getName(), connectionId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/disconnect/{userId}")
    public ResponseEntity<?> disconnect(@PathVariable Long userId, Principal principal) {
        connectionService.disconnect(principal.getName(), userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/block/{userId}")
    public ResponseEntity<BlockDTO> blockUser(@PathVariable Long userId, Principal principal) {
        return ResponseEntity.ok(connectionService.blockUser(principal.getName(), userId));
    }

    @DeleteMapping("/unblock/{userId}")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId, Principal principal) {
        connectionService.unblockUser(principal.getName(), userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ConnectionDTO>> getPendingRequests(Principal principal) {
        return ResponseEntity.ok(connectionService.getPendingRequests(principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getConnections(Principal principal) {
        return ResponseEntity.ok(connectionService.getConnections(principal.getName()));
    }

    @GetMapping("/blocked")
    public ResponseEntity<List<BlockDTO>> getBlockedUsers(Principal principal) {
        return ResponseEntity.ok(connectionService.getBlockedUsers(principal.getName()));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, String>> getConnectionStatus(@PathVariable Long userId, Principal principal) {
        String status = connectionService.getConnectionStatus(principal.getName(), userId);
        return ResponseEntity.ok(Map.of("status", status));
    }
}
