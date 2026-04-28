package com.dms.service;

import com.dms.dto.CalendarEventDTO;
import com.dms.entity.CalendarEvent;
import com.dms.entity.User;
import com.dms.repository.CalendarEventRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;

    public List<CalendarEventDTO> getUserEvents(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return calendarEventRepository.findByUserOrderByStartTimeAsc(user)
            .stream().map(CalendarEventDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public CalendarEventDTO createEvent(String username, CalendarEventDTO req) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        CalendarEvent event = CalendarEvent.builder()
            .user(user)
            .title(req.getTitle())
            .description(req.getDescription())
            .eventType(req.getEventType())
            .startTime(req.getStartTime())
            .endTime(req.getEndTime())
            .reminderEnabled(req.getReminderEnabled())
            .colorCode(req.getColorCode())
            .build();
        return CalendarEventDTO.from(calendarEventRepository.save(event));
    }

    @Transactional
    public CalendarEventDTO toggleReminder(Long id) {
        CalendarEvent event = calendarEventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setReminderEnabled(!event.getReminderEnabled());
        return CalendarEventDTO.from(calendarEventRepository.save(event));
    }
}
