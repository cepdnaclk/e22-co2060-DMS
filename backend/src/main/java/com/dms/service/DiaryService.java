package com.dms.service;

import com.dms.dto.DiaryCommentDTO;
import com.dms.dto.DiaryPostDTO;
import com.dms.entity.DiaryComment;
import com.dms.entity.DiaryPost;
import com.dms.entity.User;
import com.dms.repository.DiaryCommentRepository;
import com.dms.repository.DiaryPostRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryPostRepository diaryPostRepository;
    private final DiaryCommentRepository diaryCommentRepository;
    private final UserRepository userRepository;

    public List<DiaryPostDTO> getDiariesByUserId(Long userId, String currentUsername) {
        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }
        final User finalCurrentUser = currentUser;
        return diaryPostRepository.findAllByAuthorIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(post -> DiaryPostDTO.from(post, finalCurrentUser))
            .collect(Collectors.toList());
    }

    @Transactional
    public DiaryPostDTO createDiaryPost(DiaryPostDTO req, String username) {
        User author = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        DiaryPost post = DiaryPost.builder()
            .author(author)
            .title(req.getTitle())
            .content(req.getContent())
            .imageUrl(req.getImageUrl())
            .videoUrl(req.getVideoUrl())
            .build();

        DiaryPost saved = diaryPostRepository.save(post);
        return DiaryPostDTO.from(saved, author);
    }

    @Transactional
    public DiaryPostDTO toggleLike(Long id, String username) {
        DiaryPost post = diaryPostRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diary post not found"));
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getLikes().contains(user)) {
            post.getLikes().remove(user);
        } else {
            post.getLikes().add(user);
        }

        DiaryPost saved = diaryPostRepository.save(post);
        return DiaryPostDTO.from(saved, user);
    }

    @Transactional
    public DiaryCommentDTO addComment(Long id, String commentText, String username) {
        DiaryPost post = diaryPostRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diary post not found"));
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        DiaryComment comment = DiaryComment.builder()
            .post(post)
            .author(user)
            .content(commentText)
            .build();

        DiaryComment saved = diaryCommentRepository.save(comment);
        return DiaryCommentDTO.from(saved);
    }

    @Transactional
    public DiaryPostDTO incrementShare(Long id, String username) {
        DiaryPost post = diaryPostRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diary post not found"));
        post.setShareCount(post.getShareCount() + 1);
        DiaryPost saved = diaryPostRepository.save(post);

        User currentUser = null;
        if (username != null) {
            currentUser = userRepository.findByUsername(username).orElse(null);
        }
        return DiaryPostDTO.from(saved, currentUser);
    }

    @Transactional
    public DiaryPostDTO setVerified(Long id, boolean verified, String username) {
        User caller = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (caller.getRole() != User.Role.ORGANIZER) {
            throw new RuntimeException("Unauthorized: Only organizers can verify posts");
        }

        DiaryPost post = diaryPostRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diary post not found"));
        post.setIsVerified(verified);
        DiaryPost saved = diaryPostRepository.save(post);

        return DiaryPostDTO.from(saved, caller);
    }

    @Transactional
    public void deleteDiaryPost(Long id, String username) {
        User caller = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        DiaryPost post = diaryPostRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diary post not found"));

        if (!post.getAuthor().getId().equals(caller.getId()) && caller.getRole() != User.Role.ORGANIZER) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        diaryPostRepository.delete(post);
    }
}
