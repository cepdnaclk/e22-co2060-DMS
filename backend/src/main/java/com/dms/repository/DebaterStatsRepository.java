package com.dms.repository;

import com.dms.entity.DebaterStats;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DebaterStatsRepository extends JpaRepository<DebaterStats, Long> {
    Optional<DebaterStats> findByDebater(User debater);

    @Query("SELECT ds FROM DebaterStats ds ORDER BY ds.wins DESC, ds.playerOfMatchCount DESC")
    List<DebaterStats> findTopDebaters();
}
