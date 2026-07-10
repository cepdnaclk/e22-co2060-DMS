package com.dms.service;

import com.dms.dto.UserDTO;
import com.dms.entity.User;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(UserDTO::from).collect(Collectors.toList());
    }

    public UserDTO getById(Long id) {
        return UserDTO.from(userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found")));
    }

    public List<UserDTO> searchDebaters(String query) {
        return userRepository.searchByRoleAndQuery(User.Role.DEBATER, query)
            .stream().map(UserDTO::from).collect(Collectors.toList());
    }

    public List<UserDTO> searchJudges(String query) {
        return userRepository.searchByRoleAndQuery(User.Role.JUDGE, query)
            .stream().map(UserDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO req) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getAge() != null) user.setAge(req.getAge());
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getProfilePictureUrl() != null) user.setProfilePictureUrl(req.getProfilePictureUrl());
        if (req.getSocialLinksJson() != null) user.setSocialLinksJson(req.getSocialLinksJson());
        if (req.getPrivacyStatus() != null) user.setPrivacyStatus(req.getPrivacyStatus());
        if (req.getLanguage() != null) user.setLanguage(req.getLanguage());
        if (req.getExpertise() != null) user.setExpertise(req.getExpertise());
        if (req.getYearsOfExperience() != null) user.setYearsOfExperience(req.getYearsOfExperience());

        return UserDTO.from(userRepository.save(user));
    }

    public List<UserDTO> getTopDebaters() {
        return userRepository.findTopDebaters().stream()
            .limit(10).map(UserDTO::from).collect(Collectors.toList());
    }

    public List<UserDTO> getOrganizers() {
        return userRepository.findAllOrganizers().stream()
            .map(UserDTO::from).collect(Collectors.toList());
    }
}
