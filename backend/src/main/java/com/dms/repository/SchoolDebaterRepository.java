package com.dms.repository;

import com.dms.entity.School;
import com.dms.entity.SchoolDebater;
import com.dms.entity.Tournament;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SchoolDebaterRepository extends JpaRepository<SchoolDebater, Long> {
    List<SchoolDebater> findBySchool(School school);

    @Query("SELECT sd FROM SchoolDebater sd WHERE sd.school.tournament = :tournament AND sd.debater = :debater")
    List<SchoolDebater> findByTournamentAndDebater(@Param("tournament") Tournament tournament,
                                                   @Param("debater") User debater);

    @Query("SELECT sd FROM SchoolDebater sd WHERE sd.school.tournament = :tournament")
    List<SchoolDebater> findByTournament(@Param("tournament") Tournament tournament);
}
