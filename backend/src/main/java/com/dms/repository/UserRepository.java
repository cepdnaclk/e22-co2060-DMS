package com.dms.repository;

import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    List<User> findByRoleAndFullNameContainingIgnoreCaseOrRoleAndUsernameContainingIgnoreCase(
        User.Role role1, String name, User.Role role2, String username);

    @Query("SELECT u FROM User u WHERE u.role = :role AND " +
           "(LOWER(u.fullName) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%',:query,'%')))")
    List<User> searchByRoleAndQuery(@Param("role") User.Role role, @Param("query") String query);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%',:query,'%'))")
    List<User> searchAll(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.role = 'DEBATER' ORDER BY (SELECT COALESCE(ds.wins,0) FROM DebaterStats ds WHERE ds.debater = u) DESC")
    List<User> findTopDebaters();

    @Query("SELECT u FROM User u WHERE u.role = 'ORGANIZER'")
    List<User> findAllOrganizers();
}
