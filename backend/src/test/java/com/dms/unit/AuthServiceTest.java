package com.dms.unit;

import com.dms.dto.AuthRequest;
import com.dms.dto.AuthResponse;
import com.dms.dto.SignupRequest;
import com.dms.entity.DebaterStats;
import com.dms.entity.JudgeStats;
import com.dms.entity.User;
import com.dms.repository.DebaterStatsRepository;
import com.dms.repository.JudgeStatsRepository;
import com.dms.repository.UserRepository;
import com.dms.security.JwtUtil;
import com.dms.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit: AuthService (signup / login)")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock DebaterStatsRepository debaterStatsRepository;
    @Mock JudgeStatsRepository judgeStatsRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthService authService;

    private SignupRequest signup(String username, User.Role role) {
        SignupRequest req = new SignupRequest();
        req.setFullName("Test " + username);
        req.setUsername(username);
        req.setEmail(username + "@dms.com");
        req.setPassword("password123");
        req.setRole(role);
        return req;
    }

    private User user(long id, String username, User.Role role) {
        return User.builder().id(id).username(username).email(username + "@dms.com")
                .fullName("Test " + username).passwordHash("HASH").role(role).build();
    }

    private void stubSave() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
    }

    @Test
    @DisplayName("Debater signup hashes password, creates debater stats and returns a token")
    void signupDebater() {
        when(passwordEncoder.encode("password123")).thenReturn("HASH");
        when(jwtUtil.generateToken("deb", "DEBATER")).thenReturn("TOKEN");
        stubSave();

        AuthResponse res = authService.signup(signup("deb", User.Role.DEBATER));

        assertThat(res.getToken()).isEqualTo("TOKEN");
        assertThat(res.getUser().getUsername()).isEqualTo("deb");
        assertThat(res.getUser().getRole()).isEqualTo(User.Role.DEBATER);
        verify(userRepository).save(argThat(u -> u.getPasswordHash().equals("HASH")));
        verify(debaterStatsRepository).save(any(DebaterStats.class));
        verifyNoInteractions(judgeStatsRepository);
    }

    @Test
    @DisplayName("Judge signup creates judge stats")
    void signupJudge() {
        when(passwordEncoder.encode(any())).thenReturn("HASH");
        stubSave();

        authService.signup(signup("judge", User.Role.JUDGE));

        verify(judgeStatsRepository).save(any(JudgeStats.class));
        verifyNoInteractions(debaterStatsRepository);
    }

    @Test
    @DisplayName("Organizer signup creates no stats rows")
    void signupOrganizer() {
        when(passwordEncoder.encode(any())).thenReturn("HASH");
        stubSave();

        authService.signup(signup("org", User.Role.ORGANIZER));

        verifyNoInteractions(debaterStatsRepository, judgeStatsRepository);
    }

    @Test
    @DisplayName("Signup with a taken username is rejected")
    void signupDuplicateUsername() {
        when(userRepository.existsByUsername("deb")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(signup("deb", User.Role.DEBATER)))
                .hasMessage("Username already taken");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Signup with a registered email is rejected")
    void signupDuplicateEmail() {
        when(userRepository.existsByEmail("deb@dms.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(signup("deb", User.Role.DEBATER)))
                .hasMessage("Email already registered");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login with username and correct password returns a token")
    void loginWithUsername() {
        AuthRequest req = new AuthRequest();
        req.setUsernameOrEmail("deb");
        req.setPassword("password123");
        when(userRepository.findByUsername("deb")).thenReturn(Optional.of(user(1, "deb", User.Role.DEBATER)));
        when(passwordEncoder.matches("password123", "HASH")).thenReturn(true);
        when(jwtUtil.generateToken("deb", "DEBATER")).thenReturn("TOKEN");

        assertThat(authService.login(req).getToken()).isEqualTo("TOKEN");
    }

    @Test
    @DisplayName("Login with email falls back to email lookup")
    void loginWithEmail() {
        AuthRequest req = new AuthRequest();
        req.setUsernameOrEmail("deb@dms.com");
        req.setPassword("password123");
        when(userRepository.findByUsername("deb@dms.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("deb@dms.com")).thenReturn(Optional.of(user(1, "deb", User.Role.DEBATER)));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtUtil.generateToken("deb", "DEBATER")).thenReturn("TOKEN");

        assertThat(authService.login(req).getUser().getUsername()).isEqualTo("deb");
    }

    @Test
    @DisplayName("Login with wrong password is rejected with a generic message")
    void loginWrongPassword() {
        AuthRequest req = new AuthRequest();
        req.setUsernameOrEmail("deb");
        req.setPassword("wrong");
        when(userRepository.findByUsername("deb")).thenReturn(Optional.of(user(1, "deb", User.Role.DEBATER)));
        when(passwordEncoder.matches("wrong", "HASH")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req)).hasMessage("Invalid credentials");
        verifyNoInteractions(jwtUtil);
    }

    @Test
    @DisplayName("Login for unknown user gives the same generic message (no user enumeration)")
    void loginUnknownUser() {
        AuthRequest req = new AuthRequest();
        req.setUsernameOrEmail("ghost");
        req.setPassword("x");
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req)).hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("getMe returns the current user's profile")
    void getMe() {
        when(userRepository.findByUsername("deb")).thenReturn(Optional.of(user(7, "deb", User.Role.DEBATER)));

        assertThat(authService.getMe("deb").getId()).isEqualTo(7L);
    }
}
