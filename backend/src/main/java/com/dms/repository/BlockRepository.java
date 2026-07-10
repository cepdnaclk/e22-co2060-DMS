package com.dms.repository;

import com.dms.entity.Block;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {

    Optional<Block> findByBlockerAndBlocked(User blocker, User blocked);
    
    boolean existsByBlockerAndBlocked(User blocker, User blocked);

    List<Block> findByBlocker(User blocker);
    
    // Check if either user blocked the other
    boolean existsByBlockerAndBlockedOrBlockerAndBlocked(User blocker1, User blocked1, User blocker2, User blocked2);
}
