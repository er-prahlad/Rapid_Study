# ── Build stage ──────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Download dependencies first (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the application
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Run stage ─────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create non-root user (Phase 63 security requirement)
RUN addgroup --system --gid 1001 rapidstudy && \
    adduser --system --uid 1001 --gid 1001 rapidstudy

COPY --from=build /app/target/*.jar app.jar

# Set proper ownership
RUN chown rapidstudy:rapidstudy app.jar

USER rapidstudy

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM tuning for containers
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
