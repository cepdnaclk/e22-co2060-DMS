package com.dms.service;

import com.dms.dto.*;
import com.dms.entity.User;
import com.dms.repository.TournamentRepository;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;

    public SearchResultDTO search(String query) {
        List<User> allUsers = userRepository.searchAll(query);

        List<UserDTO> players = allUsers.stream()
            .filter(u -> u.getRole() == User.Role.DEBATER)
            .map(UserDTO::from).collect(Collectors.toList());

        List<UserDTO> organizers = allUsers.stream()
            .filter(u -> u.getRole() == User.Role.ORGANIZER)
            .map(UserDTO::from).collect(Collectors.toList());

        List<TournamentDTO> tournaments = tournamentRepository.searchByName(query)
            .stream().map(TournamentDTO::from).collect(Collectors.toList());

        return new SearchResultDTO(players, tournaments, organizers);
    }
}
