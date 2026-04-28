package com.dms.repository;

import com.dms.entity.JudgeStats;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JudgeStatsRepository extends JpaRepository<JudgeStats, Long> {
    Optional<JudgeStats> findByJudge(User judge);
}
