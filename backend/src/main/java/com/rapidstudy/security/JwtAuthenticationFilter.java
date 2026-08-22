package com.rapidstudy.security;

import com.rapidstudy.enums.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per request.
 *
 * Reads the Bearer token from the Authorization header, validates it,
 * and sets an AuthenticatedUserPrincipal in the SecurityContext so
 * downstream code has typed access to userId / email / role.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No bearer token — pass through unauthenticated
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            // Only process if no authentication is set yet
            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                String email  = jwtService.extractUsername(jwt);
                Long   userId = jwtService.extractUserId(jwt);
                String roleStr = jwtService.extractRole(jwt);

                if (email != null && userId != null && roleStr != null) {
                    // Parse role safely; unknown roles get treated as STUDENT
                    Role role;
                    try {
                        role = Role.valueOf(roleStr);
                    } catch (IllegalArgumentException ex) {
                        log.warn("Unknown role in JWT: {}", roleStr);
                        role = Role.STUDENT;
                    }

                    AuthenticatedUserPrincipal principal =
                            new AuthenticatedUserPrincipal(userId, email, role);

                    // Validate token against the principal's username
                    if (jwtService.isTokenValid(jwt, principal)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        principal,
                                        null,
                                        principal.getAuthorities());

                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception ex) {
            // Invalid/expired tokens are silently skipped;
            // the request continues and Spring Security will return 401
            log.debug("JWT validation failed for request {}: {}", request.getRequestURI(), ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
