package com.dms.repository;

import com.dms.entity.School;
import com.dms.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByTournament(Tournament tournament);
    boolean existsByNameAndTournament(String name, Tournament tournament);
}
