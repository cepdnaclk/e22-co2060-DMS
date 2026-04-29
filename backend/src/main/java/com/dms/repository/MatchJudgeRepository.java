package com.dms.repository;

import com.dms.entity.Match;
import com.dms.entity.MatchJudge;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchJudgeRepository extends JpaRepository<MatchJudge, Long> {
    List<MatchJudge> findByMatch(Match match);
    Optional<MatchJudge> findByMatchAndJudge(Match match, User judge);

    @Query("SELECT mj FROM MatchJudge mj WHERE mj.judge = :judge AND mj.submitted = false")
    List<MatchJudge> findPendingByJudge(@Param("judge") User judge);

    @Query("SELECT mj FROM MatchJudge mj WHERE mj.judge = :judge AND mj.submitted = true")
    List<MatchJudge> findCompletedByJudge(@Param("judge") User judge);
}
