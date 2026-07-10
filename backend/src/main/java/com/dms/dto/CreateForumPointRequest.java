package com.dms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateForumPointRequest {
    @NotBlank
    @Size(max = 120)
    private String authorName;

    @NotBlank
    private String role;

    @NotBlank
    private String side;

    @NotBlank
    @Size(max = 2000)
    private String content;

    private Long taggedPointId;
}
