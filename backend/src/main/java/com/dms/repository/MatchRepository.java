package com.dms.repository;

import com.dms.entity.Match;
import com.dms.entity.School;
import com.dms.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTournament(Tournament tournament);
    List<Match> findByTournamentOrderByRoundNumberAscCreatedAtAsc(Tournament tournament);
    List<Match> findByTournamentAndStatus(Tournament tournament, Match.Status status);
    Optional<Match> findByMatchCode(String matchCode);

    @Query("SELECT MAX(m.roundNumber) FROM Match m WHERE m.tournament = :tournament")
    Optional<Integer> findMaxRoundNumber(@Param("tournament") Tournament tournament);

    @Query("SELECT m FROM Match m WHERE m.tournament = :tournament AND m.roundNumber = :round")
    List<Match> findByTournamentAndRound(@Param("tournament") Tournament tournament, @Param("round") int round);

    List<Match> findByPropositionSchoolOrOppositionSchool(School prop, School opp);
    List<Match> findByStatus(Match.Status status);
}
