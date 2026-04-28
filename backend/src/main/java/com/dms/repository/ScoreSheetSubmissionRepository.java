package com.dms.repository;

import com.dms.entity.Match;
import com.dms.entity.ScoreSheetSubmission;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScoreSheetSubmissionRepository extends JpaRepository<ScoreSheetSubmission, Long> {
    List<ScoreSheetSubmission> findByMatch(Match match);
    Optional<ScoreSheetSubmission> findByMatchAndJudge(Match match, User judge);
    boolean existsByMatchAndJudge(Match match, User judge);
}
