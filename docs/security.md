# RapidStudy — Production Security Guide & Architecture

## Security Philosophy
RapidStudy follows a defense-in-depth security approach where no single layer is solely responsible for system integrity. Every boundary (client, network, gateway, controller, service, database) actively enforces security rules.

---

## 1. Authentication
- **Mechanism**: Stateless authentication utilizing standard JSON Web Tokens (JWT).
- **Session Architecture**: No session state is retained in server memory (`SessionCreationPolicy.STATELESS`).
- **Token Separation**:
  - **Access Token**: Short-lived (24 hours) for API requests.
  - **Refresh Token**: Long-lived (7 days) for token rotation.
- **Verification**: `JwtAuthenticationFilter` runs before Spring's `UsernamePasswordAuthenticationFilter`, extracting the Bearer token, verifying cryptographic integrity with HMAC-SHA256, and populating `AuthenticatedUserPrincipal`.

---

## 2. Authorization & RBAC
- **Role Hierarchy**: Two distinct roles defined in enum `Role`:
  - `STUDENT`: Read access to published tests, practice questions, personal attempts, bookmarks, leaderboard, and profile.
  - `ADMIN`: Full access to user management, content authoring, test publishing, bulk question imports, and analytics.
- **Method-Level Security**: Enabled via `@EnableMethodSecurity`. Admin endpoints explicitly enforce `@PreAuthorize("hasRole('ADMIN')")`.
- **URL Rule Filtering**: Configured centrally in `SecurityConfig`:
  - Public routes (`/api/auth/**`, `/api/exams/**`, `/api/tests/**`, Swagger, Actuator health).
  - Admin-only routes (`/api/admin/**`).
  - Authenticated-only routes (`/api/student/**`, `/api/attempts/**`, `/api/bookmarks/**`, etc.).

---

## 3. JWT Security
- **Algorithm**: HMAC-SHA256 (`jjwt 0.12.3`).
- **Secret Key**: Cryptographically random 256-bit+ key supplied via environment variable `JWT_SECRET`.
- **Claims Payload**:
  - Subject: User email
  - `userId`: Numeric identifier
  - `role`: Role name (e.g. `ROLE_STUDENT` or `ROLE_ADMIN`)
  - `exp`: Expiration timestamp
  - `iat`: Issued at timestamp
- **Token Expiry Enforcement**: Automatic rejection of expired tokens with HTTP 401 Unauthorized via `GlobalExceptionHandler`.

---

## 4. Password Hashing
- **Algorithm**: `BCryptPasswordEncoder` with standard cost factor 10.
- **Salting**: Automatic cryptographically secure per-password salting.
- **Protection**:
  - Passwords are never stored in plain text.
  - Raw passwords are never returned in responses (DTOs exclude `passwordHash`).
  - Passwords are scrubbed from log outputs.

---

## 5. CORS (Cross-Origin Resource Sharing)
- **Configuration**: Configured in `CorsConfig` bean.
- **Origins**: Configurable via `CORS_ALLOWED_ORIGINS` environment variable (defaults to `http://localhost:3000` in dev).
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.
- **Allowed Headers**: `Authorization`, `Content-Type`, `X-Requested-With`, `Accept`.
- **Credentials**: Allowed (`allowCredentials(true)`) for secure cookie handling.

---

## 6. Rate Limiting
- **Implementation**: Redis-backed token bucket filter (`RateLimitFilter` + `RateLimitService`).
- **Auth Protection**: Limits login and registration attempts to **20 requests per minute per IP** to prevent brute-force attacks.
- **AI Endpoints**: Limits AI queries to **10 requests per minute per user** to prevent API key quota exhaustion.
- **Fail-Safe**: If Redis is temporarily unreachable, rate limiting fails open gracefully while logging a warning.

---

## 7. Input Validation
- **Backend Validation**: Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Size`, `@Email`, `@Min`, `@Max`).
- **Frontend Validation**: Zod schema validation integrated with React Hook Form.
- **Sanitization**: Input text trimmed, HTML characters escaped to prevent Cross-Site Scripting (XSS).

---

## 8. SQL Injection Prevention
- **ORM / Persistence**: Spring Data JPA and Hibernate with parameterized queries.
- **JPQL & Criteria**: All database queries use parameterized placeholders (`:param`).
- **No String Concatenation**: Dynamic queries avoid raw SQL string concatenation.

---

## 9. IDOR (Insecure Direct Object Reference) Prevention
- **User Identity**: All student-facing mutations and queries extract user identity exclusively from the authenticated JWT principal (`SecurityUtil.currentUserId()`), never from client-supplied request bodies or query parameters.
- **Resource Ownership Verification**:
  - `attemptService` verifies `attempt.getUser().getId().equals(currentUserId)` before allowing any save, clear, review, or submit action.
  - Attempt results and analysis can only be viewed by the user who took the test.
  - Bookmarks and study plans are strictly filtered by `userId`.

---

## 10. File Upload Security
- **Endpoints**: `/api/admin/questions/import` for CSV and XLSX files.
- **Role Restricted**: Only accessible by authenticated administrators (`@PreAuthorize("hasRole('ADMIN')")`).
- **Extension & MIME Validation**: Strict verification of file extensions (`.csv`, `.xlsx`) and MIME types (`text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
- **File Size Limit**: Configured maximum size (10 MB via `spring.servlet.multipart.max-file-size`).
- **Path Traversal Protection**: Uploaded files are processed strictly in-memory or in isolated temporary streams; filenames are never passed directly to disk operations.

---

## 11. Sensitive Data Exposure & Anti-Cheat
- **Question Masking**: When tests are active, questions are returned via `QuestionSafeDto`, completely stripping:
  - `isCorrect` on options
  - Solution explanations
- **Server Timer Integrity**: Expiration time (`expiresAt`) is calculated and set solely on the backend (`now + durationMinutes`).
- **Submission Lockout**: Once an attempt status is `COMPLETED` or `EXPIRED`, no further answers or changes are accepted.
- **Server Scoring**: All marks and negative penalties are calculated on the server using authoritative database options.

---

## 12. Logging Security
- **Structured Output**: Format: `%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n`.
- **Redaction Policy**: Passwords, refresh tokens, auth headers, and full credit credentials are never logged.
- **Error Logs**: Stack traces are logged internally at ERROR level for debugging, but never leaked to HTTP clients.

---

## 13. Secrets & Configuration Management
- **Environment Driven**: All sensitive secrets (`JWT_SECRET`, `DB_PASSWORD`, `REDIS_PASSWORD`, `AI_API_KEY`) are injected via environment variables.
- **Version Control**: `.env` is ignored by `.gitignore`. Only `.env.example` with dummy values is checked into git.
- **Production Overrides**: `application-prod.yml` enforces production standards.

---

## 14. Error Responses
- **Global Handler**: `GlobalExceptionHandler` intercepts all exceptions (`ResourceNotFoundException`, `BadRequestException`, `ForbiddenException`, `UnauthorizedException`, `MethodArgumentNotValidException`, `Exception`).
- **Sanitized Payloads**: Error responses follow a uniform structure:
  ```json
  {
    "success": false,
    "message": "User-friendly error message",
    "timestamp": "2026-09-15T11:00:00",
    "errors": { "field": "Field specific validation error" }
  }
  ```
- **No Stack Traces**: `server.error.include-stacktrace: never` is enforced in configuration.
