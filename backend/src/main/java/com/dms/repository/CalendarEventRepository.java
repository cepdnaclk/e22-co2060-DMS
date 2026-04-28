package com.dms.repository;

import com.dms.entity.CalendarEvent;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUserOrderByStartTimeAsc(User user);
}
