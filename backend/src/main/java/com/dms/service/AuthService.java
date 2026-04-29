package com.dms.service;

import com.dms.dto.*;
import com.dms.entity.*;
import com.dms.repository.*;
import com.dms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DebaterStatsRepository debaterStatsRepository;
    private final JudgeStatsRepository judgeStatsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
            .fullName(req.getFullName())
            .username(req.getUsername())
            .age(req.getAge())
            .bio(req.getBio())
            .location(req.getLocation())
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .role(req.getRole())
            .profilePictureUrl(req.getProfilePictureUrl())
            .socialLinksJson(req.getSocialLinksJson())
            .expertise(req.getExpertise())
            .yearsOfExperience(req.getYearsOfExperience())
            .build();

        user = userRepository.save(user);

        if (user.getRole() == User.Role.DEBATER) {
            debaterStatsRepository.save(DebaterStats.builder().debater(user).build());
        } else if (user.getRole() == User.Role.JUDGE) {
            judgeStatsRepository.save(JudgeStats.builder().judge(user).build());
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, UserDTO.from(user));
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByUsername(req.getUsernameOrEmail())
            .or(() -> userRepository.findByEmail(req.getUsernameOrEmail()))
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, UserDTO.from(user));
    }

    public UserDTO getMe(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDTO.from(user);
    }
}
