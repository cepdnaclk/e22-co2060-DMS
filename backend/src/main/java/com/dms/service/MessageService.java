package com.dms.service;

import com.dms.dto.MessageDTO;
import com.dms.entity.Message;
import com.dms.entity.User;
import com.dms.repository.MessageRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<MessageDTO> getMessagesForUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return messageRepository.findAllByParticipantId(user.getId())
                .stream()
                .map(MessageDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO saveMessage(String senderUsername, Long receiverId, String text) {
        User sender = userRepository.findByUsername(senderUsername)
                .or(() -> userRepository.findByEmail(senderUsername))
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .text(text)
                .build();

        return MessageDTO.from(messageRepository.save(message));
    }
}
