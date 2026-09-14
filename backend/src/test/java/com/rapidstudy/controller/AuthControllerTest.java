package com.rapidstudy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Phase 60: Auth Controller Integration Tests
 * Spring context ke saath real HTTP calls test karta hai.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Phase 60: Auth Controller Tests")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/auth/health → 200 OK")
    void healthCheck() throws Exception {
        mockMvc.perform(get("/api/v1/auth/health"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register → missing name → 400")
    void registerMissingName() throws Exception {
        Map<String, String> body = Map.of(
            "email",    "test@example.com",
            "password", "Test@1234"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login → wrong credentials → 401")
    void loginWrongCredentials() throws Exception {
        Map<String, String> body = Map.of(
            "email",    "nonexistent@test.com",
            "password", "WrongPassword@1"
        );
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/auth/me → no token → 401")
    void getMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/exams → public → 200")
    void publicExamsEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/exams"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/student/dashboard → no token → 401")
    void dashboardRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/v1/student/dashboard"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/users → no token → 401")
    void adminRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register → weak password → 400")
    void registerWeakPassword() throws Exception {
        Map<String, String> body = Map.of(
            "name",     "Test User",
            "email",    "test@example.com",
            "password", "123"  // too weak
        );
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
               .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /actuator/health → 200")
    void actuatorHealth() throws Exception {
        mockMvc.perform(get("/actuator/health"))
               .andExpect(status().isOk());
    }
}
