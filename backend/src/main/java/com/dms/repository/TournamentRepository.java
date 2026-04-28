package com.dms.repository;

import com.dms.entity.Tournament;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByOrganizer(User organizer);
    List<Tournament> findByStatus(Tournament.Status status);

    @Query("SELECT t FROM Tournament t WHERE " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%',:query,'%'))")
    List<Tournament> searchByName(@Param("query") String query);

    @Query("SELECT t FROM Tournament t WHERE t.status = 'ACTIVE' ORDER BY t.createdAt DESC")
    List<Tournament> findActiveTournaments();
}
