package com.dms.repository;

import com.dms.entity.ScoreSheetTemplate;
import com.dms.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScoreSheetTemplateRepository extends JpaRepository<ScoreSheetTemplate, Long> {
    Optional<ScoreSheetTemplate> findByTournament(Tournament tournament);
    Optional<ScoreSheetTemplate> findTopByTournamentOrderByCreatedAtDesc(Tournament tournament);
}
