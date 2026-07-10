package com.dms.service;

import com.dms.dto.BlockDTO;
import com.dms.dto.ConnectionDTO;
import com.dms.dto.UserDTO;
import com.dms.entity.Block;
import com.dms.entity.Connection;
import com.dms.entity.User;
import com.dms.repository.BlockRepository;
import com.dms.repository.ConnectionRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final BlockRepository blockRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ConnectionDTO sendRequest(String requesterUsername, Long receiverId) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (requester.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot connect with yourself");
        }

        if (blockRepository.existsByBlockerAndBlockedOrBlockerAndBlocked(requester, receiver, receiver, requester)) {
            throw new RuntimeException("Action blocked");
        }

        Optional<Connection> existing = connectionRepository.findConnectionBetween(requester, receiver);
        if (existing.isPresent()) {
            throw new RuntimeException("Connection or request already exists");
        }

        Connection connection = Connection.builder()
                .requester(requester)
                .receiver(receiver)
                .status(Connection.ConnectionStatus.PENDING)
                .build();
        
        connection = connectionRepository.save(connection);

        notificationService.send(receiver, "New Connection Request", requester.getFullName() + " wants to connect with you.");

        return ConnectionDTO.from(connection);
    }

    @Transactional
    public ConnectionDTO acceptRequest(String receiverUsername, Long connectionId) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (!connection.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Not authorized to accept this request");
        }

        connection.setStatus(Connection.ConnectionStatus.ACCEPTED);
        connection = connectionRepository.save(connection);

        notificationService.send(connection.getRequester(), "Connection Accepted", receiver.getFullName() + " accepted your connection request.");

        return ConnectionDTO.from(connection);
    }

    @Transactional
    public void rejectRequest(String receiverUsername, Long connectionId) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (!connection.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Not authorized to reject this request");
        }

        connectionRepository.delete(connection);
    }
    
    @Transactional
    public void disconnect(String username, Long otherUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));
                
        Connection connection = connectionRepository.findConnectionBetween(user, otherUser)
                .orElseThrow(() -> new RuntimeException("Connection not found"));
                
        connectionRepository.delete(connection);
    }

    @Transactional
    public BlockDTO blockUser(String blockerUsername, Long blockedId) {
        User blocker = userRepository.findByUsername(blockerUsername)
                .orElseThrow(() -> new RuntimeException("Blocker not found"));
        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new RuntimeException("Blocked user not found"));

        if (blocker.getId().equals(blocked.getId())) {
            throw new RuntimeException("Cannot block yourself");
        }

        if (blockRepository.existsByBlockerAndBlocked(blocker, blocked)) {
            throw new RuntimeException("User already blocked");
        }

        // Delete any existing connections/requests
        connectionRepository.findConnectionBetween(blocker, blocked)
                .ifPresent(connectionRepository::delete);

        Block block = Block.builder()
                .blocker(blocker)
                .blocked(blocked)
                .build();
        return BlockDTO.from(blockRepository.save(block));
    }

    @Transactional
    public void unblockUser(String blockerUsername, Long blockedId) {
        User blocker = userRepository.findByUsername(blockerUsername)
                .orElseThrow(() -> new RuntimeException("Blocker not found"));
        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new RuntimeException("Blocked user not found"));

        Block block = blockRepository.findByBlockerAndBlocked(blocker, blocked)
                .orElseThrow(() -> new RuntimeException("Block not found"));

        blockRepository.delete(block);
    }

    public List<ConnectionDTO> getPendingRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return connectionRepository.findByReceiverAndStatus(user, Connection.ConnectionStatus.PENDING)
                .stream().map(ConnectionDTO::from).collect(Collectors.toList());
    }

    public List<UserDTO> getConnections(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return connectionRepository.findAcceptedConnectionsForUser(user).stream()
                .map(c -> c.getRequester().getId().equals(user.getId()) ? c.getReceiver() : c.getRequester())
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public List<BlockDTO> getBlockedUsers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return blockRepository.findByBlocker(user)
                .stream().map(BlockDTO::from).collect(Collectors.toList());
    }

    public String getConnectionStatus(String username, Long otherUserId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return "NONE";
        
        User otherUser = userRepository.findById(otherUserId).orElse(null);
        if (otherUser == null) return "NONE";
        
        if (user.getId().equals(otherUser.getId())) return "SELF";

        if (blockRepository.existsByBlockerAndBlockedOrBlockerAndBlocked(user, otherUser, otherUser, user)) {
            return "BLOCKED";
        }

        Optional<Connection> connection = connectionRepository.findConnectionBetween(user, otherUser);
        if (connection.isEmpty()) {
            return "NONE";
        }

        Connection c = connection.get();
        if (c.getStatus() == Connection.ConnectionStatus.ACCEPTED) {
            return "ACCEPTED";
        } else {
            if (c.getRequester().getId().equals(user.getId())) {
                return "PENDING_SENT";
            } else {
                return "PENDING_RECEIVED";
            }
        }
    }
}
