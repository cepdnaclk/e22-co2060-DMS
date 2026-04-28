package com.dms.service;

import com.dms.dto.DiscussionCommentDTO;
import com.dms.entity.DiscussionComment;
import com.dms.entity.Tournament;
import com.dms.entity.User;
import com.dms.repository.DiscussionCommentRepository;
import com.dms.repository.TournamentRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscussionService {

    private final DiscussionCommentRepository commentRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;

    public List<DiscussionCommentDTO> getComments(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return commentRepository.findByTournamentAndParentCommentIsNullOrderByCreatedAtDesc(tournament)
            .stream().map(DiscussionCommentDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public DiscussionCommentDTO addComment(Long tournamentId, Long userId, String comment, Long parentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        DiscussionComment.DiscussionCommentBuilder builder = DiscussionComment.builder()
            .tournament(tournament).user(user).comment(comment);

        if (parentId != null) {
            DiscussionComment parent = commentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            builder.parentComment(parent);
        }

        return DiscussionCommentDTO.from(commentRepository.save(builder.build()));
    }

    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
