package com.dms.dto;

import com.dms.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String fullName;
    private String username;
    private Integer age;
    private String bio;
    private String location;
    private String email;
    private User.Role role;
    private String profilePictureUrl;
    private String socialLinksJson;
    private User.PrivacyStatus privacyStatus;
    private String language;
    private String expertise;
    private Integer yearsOfExperience;
    private LocalDateTime createdAt;

    public static UserDTO from(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setFullName(u.getFullName());
        dto.setUsername(u.getUsername());
        dto.setAge(u.getAge());
        dto.setBio(u.getBio());
        dto.setLocation(u.getLocation());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole());
        dto.setProfilePictureUrl(u.getProfilePictureUrl());
        dto.setSocialLinksJson(u.getSocialLinksJson());
        dto.setPrivacyStatus(u.getPrivacyStatus());
        dto.setLanguage(u.getLanguage());
        dto.setExpertise(u.getExpertise());
        dto.setYearsOfExperience(u.getYearsOfExperience());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }
}
