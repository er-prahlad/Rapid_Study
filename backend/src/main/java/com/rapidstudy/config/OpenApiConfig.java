package com.rapidstudy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Phase 62: OpenAPI / Swagger configuration.
 *
 * Swagger UI: /swagger-ui.html
 * API Docs:   /v3/api-docs
 *
 * Features:
 * - Bearer JWT auth support (lock icon on every endpoint)
 * - Multiple server URLs (local + production)
 * - Complete API documentation with descriptions
 */
@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RapidStudy API")
                        .version("1.0.0")
                        .description("""
                            ## RapidStudy — Competitive Exam Preparation Platform
                            
                            India ke students ke liye competitive exam preparation platform.
                            
                            ### Supported Exams
                            SSC CGL, SSC CHSL, UPSC CSE, BPSC, Railway, Bank PO
                            
                            ### Authentication
                            JWT Bearer token use karo. `/api/v1/auth/login` se token lo,
                            phir har request mein `Authorization: Bearer <token>` header bhejo.
                            
                            ### Security
                            - Server-authoritative scoring (client pe calculate nahi)
                            - Server-controlled test timer
                            - Answer keys never exposed during active test
                            """)
                        .contact(new Contact()
                                .name("RapidStudy Team")
                                .email("support@rapidstudy.in")
                                .url("https://rapidstudy.in"))
                        .license(new License()
                                .name("Private")
                                .url("https://rapidstudy.in/terms")))

                // Server list — local + production
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.rapidstudy.in").description("Production")
                ))

                // Global JWT security requirement — har endpoint pe lock icon
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))

                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Access token paste karo (without 'Bearer ' prefix)")));
    }
}
