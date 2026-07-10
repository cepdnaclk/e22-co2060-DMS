package com.dms.dto;

import com.dms.entity.Block;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BlockDTO {
    private Long id;
    private UserDTO blocker;
    private UserDTO blocked;
    private LocalDateTime createdAt;

    public static BlockDTO from(Block b) {
        BlockDTO dto = new BlockDTO();
        dto.setId(b.getId());
        dto.setBlocker(UserDTO.from(b.getBlocker()));
        dto.setBlocked(UserDTO.from(b.getBlocked()));
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
