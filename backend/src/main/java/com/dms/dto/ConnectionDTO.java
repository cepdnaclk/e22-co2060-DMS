package com.dms.dto;

import com.dms.entity.Connection;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConnectionDTO {
    private Long id;
    private UserDTO requester;
    private UserDTO receiver;
    private Connection.ConnectionStatus status;
    private LocalDateTime createdAt;

    public static ConnectionDTO from(Connection c) {
        ConnectionDTO dto = new ConnectionDTO();
        dto.setId(c.getId());
        dto.setRequester(UserDTO.from(c.getRequester()));
        dto.setReceiver(UserDTO.from(c.getReceiver()));
        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
