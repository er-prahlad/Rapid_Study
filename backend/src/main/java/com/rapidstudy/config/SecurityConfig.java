package com.rapidstudy.config;

import com.rapidstudy.security.JwtAuthenticationFilter;
import com.rapidstudy.config.RateLimitFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security configuration.
 *
 * Route access rules:
 *
 *  PUBLIC      — auth endpoints, Swagger, Actuator health
 *  STUDENT     — all /api/v1/student/**, /api/v1/exams/**, etc.
 *  ADMIN       — all /api/v1/admin/**
 *  AUTHENTICATED — everything else (fallback)
 *
 * JWT is validated by JwtAuthenticationFilter before this chain runs.
 * Sessions are STATELESS — no HttpSession is created.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource       corsConfigurationSource;
    private final JwtAuthenticationFilter        jwtAuthenticationFilter;
    private final UserDetailsService             userDetailsService;
    private final RateLimitFilter                rateLimitFilter;

    // ---------------------------------------------------------------
    // Security filter chain
    // ---------------------------------------------------------------

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — we use JWT (stateless)
            .csrf(AbstractHttpConfigurer::disable)

            // CORS configured via CorsConfig bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // No sessions
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Phase 56: Secure headers
            .headers(headers -> headers
                    .frameOptions(frame -> frame.deny())
                    .contentTypeOptions(ct -> {})
                    .httpStrictTransportSecurity(hsts -> hsts
                            .includeSubDomains(true)
                            .maxAgeInSeconds(31536000))
            )

            // Route access rules
            .authorizeHttpRequests(auth -> auth

                // ── PUBLIC ──────────────────────────────────────────────
                .requestMatchers(
                        "/health",
                        "/api/v1/auth/**",
                        "/api/auth/**",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/actuator/health",
                        "/actuator/info"
                ).permitAll()

                // ── READ-ONLY PUBLIC exam/test browsing ──────────────────
                .requestMatchers(HttpMethod.GET,
                        "/api/v1/exams",
                        "/api/v1/exams/**",
                        "/api/exams",
                        "/api/exams/**",
                        "/api/v1/tests",
                        "/api/v1/tests/**",
                        "/api/tests",
                        "/api/tests/**",
                        "/api/v1/questions",
                        "/api/v1/questions/**",
                        "/api/questions",
                        "/api/questions/**",
                        "/api/v1/search",
                        "/api/search"
                ).permitAll()

                // ── ADMIN ONLY ───────────────────────────────────────────
                .requestMatchers("/api/v1/admin/**", "/api/admin/**").hasRole("ADMIN")

                // ── STUDENT + ADMIN (any authenticated user) ─────────────
                .requestMatchers(
                        "/api/v1/student/**",     "/api/student/**",
                        "/api/v1/tests/**",       "/api/tests/**",
                        "/api/v1/attempts/**",    "/api/attempts/**",
                        "/api/v1/questions/**",   "/api/questions/**",
                        "/api/v1/practice/**",    "/api/practice/**",
                        "/api/v1/bookmarks/**",   "/api/bookmarks/**",
                        "/api/v1/leaderboard/**", "/api/leaderboard/**",
                        "/api/v1/study-plan/**",  "/api/study-plan/**",
                        "/api/v1/notifications/**", "/api/notifications/**",
                        "/api/v1/ai/**",          "/api/ai/**"
                ).authenticated()

                // ── EVERYTHING ELSE requires authentication ───────────────
                .anyRequest().authenticated()
            )

            // Plug in the DaoAuthenticationProvider
            .authenticationProvider(authenticationProvider())

            // Rate limiting filter (auth endpoints)
            .addFilterBefore(rateLimitFilter,         UsernamePasswordAuthenticationFilter.class)
            // JWT filter runs before Spring's username/password filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ---------------------------------------------------------------
    // Beans
    // ---------------------------------------------------------------

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
