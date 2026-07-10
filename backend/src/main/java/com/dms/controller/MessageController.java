package com.dms.controller;

import com.dms.dto.MessageDTO;
import com.dms.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageDTO>> getMessages(Authentication auth) {
        return ResponseEntity.ok(messageService.getMessagesForUser(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody Map<String, Object> body, Authentication auth) {
        Long receiverId = Long.parseLong(body.get("receiverId").toString());
        String text = body.get("text").toString();
        return ResponseEntity.ok(messageService.saveMessage(auth.getName(), receiverId, text));
    }
}
