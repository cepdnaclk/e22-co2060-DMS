package com.dms.service;

import com.dms.dto.NotificationDTO;
import com.dms.entity.Notification;
import com.dms.entity.User;
import com.dms.repository.NotificationRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void send(User user, String title, String message) {
        send(user, title, message, null);
    }

    public void send(User user, String title, String message, String link) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .link(link)
            .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(NotificationDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public void markRead(Long id, String username) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setReadStatus(true);
        notificationRepository.save(n);
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndReadStatusFalse(user);
    }
}
