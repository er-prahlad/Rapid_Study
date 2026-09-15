package com.rapidstudy.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rapidstudy.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Phase 56: Rate limiting servlet filter.
 * Auth endpoints pe stricter limit apply karta hai.
 * Redis se backed — Redis down hone par fail-open.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper     objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip   = getClientIp(request);

        // Auth endpoints — stricter (20 req/min per IP)
        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
            if (!rateLimitService.isAuthAllowed(ip)) {
                sendRateLimitResponse(response, "Too many auth attempts. Please wait before trying again.");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "success",   false,
                "message",   message,
                "timestamp", java.time.LocalDateTime.now().toString()
        )));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Public assets, actuator, swagger skip karo
        String path = request.getRequestURI();
        return path.startsWith("/actuator")
            || path.startsWith("/v3/api-docs")
            || path.startsWith("/swagger-ui");
    }
}
