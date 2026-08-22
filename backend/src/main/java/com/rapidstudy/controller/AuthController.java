package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.auth.AuthResponse;
import com.rapidstudy.dto.auth.LoginRequest;
import com.rapidstudy.dto.auth.RefreshTokenRequest;
import com.rapidstudy.dto.auth.RegisterRequest;
import com.rapidstudy.dto.auth.UserProfileResponse;
import com.rapidstudy.service.AuthService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST endpoints.
 *
 * POST /api/v1/auth/register   — create account
 * POST /api/v1/auth/login      — get JWT tokens
 * POST /api/v1/auth/refresh    — exchange refresh token for new access token
 * POST /api/v1/auth/logout     — client-side logout (stateless — just HTTP 200)
 * GET  /api/v1/auth/me         — return current user profile (requires JWT)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, refresh token, and profile")
public class AuthController {

    private final AuthService authService;

    // ---------------------------------------------------------------
    // Register
    // ---------------------------------------------------------------

    @PostMapping("/register")
    @Operation(summary = "Register a new student account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse body = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", body));
    }

    // ---------------------------------------------------------------
    // Login
    // ---------------------------------------------------------------

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse body = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", body));
    }

    // ---------------------------------------------------------------
    // Refresh token
    // ---------------------------------------------------------------

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse body = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", body));
    }

    // ---------------------------------------------------------------
    // Logout (stateless — client discards tokens)
    // ---------------------------------------------------------------

    @PostMapping("/logout")
    @Operation(
        summary = "Logout (stateless)",
        description = "Signals logout intent. The client must discard stored tokens. "
                    + "For full server-side token revocation add Redis token blacklist in a later phase.",
        security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT is stateless — no server state to clear here.
        // A Redis token blacklist will be added in the Redis/caching phase.
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    // ---------------------------------------------------------------
    // Current user profile  (requires valid JWT)
    // ---------------------------------------------------------------

    @GetMapping("/me")
    @Operation(
        summary = "Get current authenticated user profile",
        security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<UserProfileResponse>> me() {
        Long userId = SecurityUtil.currentUserId();
        UserProfileResponse profile = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }
}
