package com.dms.repository;

import com.dms.entity.Tournament;
import com.dms.entity.TournamentJudge;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TournamentJudgeRepository extends JpaRepository<TournamentJudge, Long> {
    List<TournamentJudge> findByTournament(Tournament tournament);
    Optional<TournamentJudge> findByTournamentAndJudge(Tournament tournament, User judge);
    boolean existsByTournamentAndJudge(Tournament tournament, User judge);
    long countByTournament(Tournament tournament);
}
