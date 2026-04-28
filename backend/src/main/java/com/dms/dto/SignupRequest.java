package com.dms.dto;

import com.dms.entity.User;
import lombok.Data;

@Data
public class SignupRequest {
    private String fullName;
    private String username;
    private Integer age;
    private String bio;
    private String location;
    private String email;
    private String password;
    private User.Role role;
    private String profilePictureUrl;
    private String socialLinksJson;
    private String expertise;
    private Integer yearsOfExperience;
}
