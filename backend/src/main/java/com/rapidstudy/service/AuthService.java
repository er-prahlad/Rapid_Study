package com.rapidstudy.service;

import com.rapidstudy.dto.auth.AuthResponse;
import com.rapidstudy.dto.auth.LoginRequest;
import com.rapidstudy.dto.auth.RefreshTokenRequest;
import com.rapidstudy.dto.auth.RegisterRequest;
import com.rapidstudy.dto.auth.UserProfileResponse;
import com.rapidstudy.entity.User;
import com.rapidstudy.enums.Role;
import com.rapidstudy.exception.ConflictException;
import com.rapidstudy.exception.UnauthorizedException;
import com.rapidstudy.repository.UserRepository;
import com.rapidstudy.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication business logic.
 *
 * Handles registration, login, token refresh, and profile retrieval.
 * Tokens embed userId + role so downstream services don't need extra DB calls.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtService            jwtService;
    private final AuthenticationManager authenticationManager;

    // ---------------------------------------------------------------
    // Register
    // ---------------------------------------------------------------

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setLanguage(request.getLanguage() != null
                ? request.getLanguage()
                : com.rapidstudy.enums.Language.EN);
        user.setIsActive(true);

        User saved = userRepository.save(user);
        log.info("New user registered: id={} email={}", saved.getId(), saved.getEmail());

        return buildAuthResponse(saved);
    }

    // ---------------------------------------------------------------
    // Login
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()));
        } catch (BadCredentialsException ex) {
            // Do not leak whether email or password was wrong
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated");
        }

        log.info("User logged in: id={} email={}", user.getId(), user.getEmail());
        return buildAuthResponse(user);
    }

    // ---------------------------------------------------------------
    // Refresh token
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        String email = jwtService.extractUsername(token);
        if (email == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Validate the refresh token against a minimal UserDetails
        org.springframework.security.core.userdetails.User springUser =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPasswordHash(), java.util.Collections.emptyList());

        if (!jwtService.isTokenValid(token, springUser)) {
            throw new UnauthorizedException("Refresh token is invalid or expired");
        }

        // Issue new access token; re-use the same refresh token
        String newAccessToken  = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        log.info("Token refreshed for user: id={}", user.getId());
        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    // ---------------------------------------------------------------
    // Current user profile
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .language(user.getLanguage())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private AuthResponse buildAuthResponse(User user) {
        return buildAuthResponse(
                user,
                jwtService.generateToken(user),
                jwtService.generateRefreshToken(user));
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .language(user.getLanguage())
                .build();
    }

    /** Phase 42: update language preference */
    @Transactional
    public void updateLanguage(Long userId, com.rapidstudy.enums.Language language) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.rapidstudy.exception.ResourceNotFoundException("User not found"));
        user.setLanguage(language);
        userRepository.save(user);
    }
}
