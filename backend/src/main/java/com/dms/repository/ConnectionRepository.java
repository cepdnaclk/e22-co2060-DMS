package com.dms.repository;

import com.dms.entity.Connection;
import com.dms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    Optional<Connection> findByRequesterAndReceiver(User requester, User receiver);

    @Query("SELECT c FROM Connection c WHERE (c.requester = :u1 AND c.receiver = :u2) OR (c.requester = :u2 AND c.receiver = :u1)")
    Optional<Connection> findConnectionBetween(User u1, User u2);

    List<Connection> findByReceiverAndStatus(User receiver, Connection.ConnectionStatus status);

    List<Connection> findByRequesterAndStatus(User requester, Connection.ConnectionStatus status);

    @Query("SELECT c FROM Connection c WHERE (c.requester = :user OR c.receiver = :user) AND c.status = 'ACCEPTED'")
    List<Connection> findAcceptedConnectionsForUser(User user);
    
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Connection c WHERE ((c.requester = :u1 AND c.receiver = :u2) OR (c.requester = :u2 AND c.receiver = :u1)) AND c.status = 'ACCEPTED'")
    boolean areUsersConnected(User u1, User u2);
}
