package com.rapidstudy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration.
 *
 * Adds a global "bearerAuth" security scheme so JWT-protected endpoints
 * can be tested directly from the Swagger UI by pasting the access token.
 *
 * Swagger UI: http://localhost:8080/swagger-ui.html
 * API Docs:   http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RapidStudy API")
                        .description("Competitive exam preparation platform — REST API documentation")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("RapidStudy Team")
                                .email("support@rapidstudy.in"))
                        .license(new License()
                                .name("Private")
                                .url("https://rapidstudy.in")))
                // Global security requirement — all endpoints show the lock icon
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste your access token here (without the 'Bearer ' prefix)")));
    }
}
