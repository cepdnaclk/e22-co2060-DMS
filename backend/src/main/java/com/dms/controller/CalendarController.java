package com.dms.controller;

import com.dms.dto.CalendarEventDTO;
import com.dms.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<CalendarEventDTO>> getEvents(Authentication auth) {
        return ResponseEntity.ok(calendarService.getUserEvents(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<CalendarEventDTO> createEvent(@RequestBody CalendarEventDTO req,
                                                        Authentication auth) {
        return ResponseEntity.ok(calendarService.createEvent(auth.getName(), req));
    }

    @PutMapping("/{id}/reminder")
    public ResponseEntity<CalendarEventDTO> toggleReminder(@PathVariable Long id) {
        return ResponseEntity.ok(calendarService.toggleReminder(id));
    }
}
