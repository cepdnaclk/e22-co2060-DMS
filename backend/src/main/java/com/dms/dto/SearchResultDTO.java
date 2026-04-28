package com.dms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data @AllArgsConstructor
public class SearchResultDTO {
    private List<UserDTO> players;
    private List<TournamentDTO> tournaments;
    private List<UserDTO> organizers;
}
