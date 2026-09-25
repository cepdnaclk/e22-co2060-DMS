package com.dms.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integration: Authentication API")
class AuthApiIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("Signup returns a JWT and the user profile without the password hash")
    void signupReturnsToken() throws Exception {
        mvc.perform(withJson(post("/api/auth/signup"), Map.of(
                        "fullName", "New Debater", "username", "newdeb", "email", "newdeb@test.dms",
                        "password", "password123", "role", "DEBATER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.user.username").value("newdeb"))
                .andExpect(jsonPath("$.user.role").value("DEBATER"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("Signup with an existing username is rejected with 400")
    void duplicateUsername() throws Exception {
        TestUser existing = signup("DEBATER");
        mvc.perform(withJson(post("/api/auth/signup"), Map.of(
                        "fullName", "Copy", "username", existing.username(), "email", "other@test.dms",
                        "password", "password123", "role", "DEBATER")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Username already taken"));
    }

    @Test
    @DisplayName("Login with username and with email both succeed")
    void loginWithUsernameOrEmail() throws Exception {
        TestUser u = signup("JUDGE");
        mvc.perform(withJson(post("/api/auth/login"), Map.of("usernameOrEmail", u.username(), "password", "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("JUDGE"));
        mvc.perform(withJson(post("/api/auth/login"), Map.of("usernameOrEmail", u.username() + "@test.dms", "password", "password123")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Login with a wrong password is rejected with a generic error")
    void loginWrongPassword() throws Exception {
        TestUser u = signup("DEBATER");
        mvc.perform(withJson(post("/api/auth/login"), Map.of("usernameOrEmail", u.username(), "password", "nope")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    @DisplayName("/api/auth/me returns the logged-in user")
    void meWithToken() throws Exception {
        TestUser u = signup("ORGANIZER");
        mvc.perform(as(u, get("/api/auth/me")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(u.username()));
    }

    @Test
    @DisplayName("Signup without a password is rejected with 400 (input validation)")
    void signupMissingPassword() throws Exception {
        mvc.perform(withJson(post("/api/auth/signup"), Map.of(
                        "fullName", "No Pass", "username", "nopass", "email", "nopass@test.dms", "role", "DEBATER")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Signup with an invalid email address is rejected with 400 (input validation)")
    void signupInvalidEmail() throws Exception {
        mvc.perform(withJson(post("/api/auth/signup"), Map.of(
                        "fullName", "Bad Email", "username", "bademail", "email", "not-an-email",
                        "password", "password123", "role", "DEBATER")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Newsletter: valid email subscribes, invalid email gives 400")
    void newsletter() throws Exception {
        mvc.perform(withJson(post("/api/newsletter/subscribe"), Map.of("email", "fan@test.dms")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Successfully subscribed")));
        mvc.perform(withJson(post("/api/newsletter/subscribe"), Map.of("email", "fan@test.dms")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("already subscribed")));
        mvc.perform(withJson(post("/api/newsletter/subscribe"), Map.of("email", "broken@")))
                .andExpect(status().isBadRequest());
    }
}
