# RapidStudy - Security Documentation

## Security Overview

RapidStudy implements defense-in-depth security across all layers of the application.

## Authentication

### JWT (JSON Web Tokens)

**Token Structure:**
```
Header.Payload.Signature
```

**Payload Contains:**
- User ID
- Email
- Role (STUDENT, ADMIN)
- Issued at timestamp
- Expiration timestamp

**Token Lifecycle:**
- **Access Token:** 24 hours (1 day)
- **Refresh Token:** 7 days
- Tokens are stateless (no server-side storage required)

**Token Storage:**
- Web: Secure HTTP-only cookies (preferred) or localStorage with XSS protection
- Android: Encrypted SharedPreferences / DataStore

### Password Security

**Hashing Algorithm:** BCrypt with strength 12

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Best Practices:**
- Passwords never logged
- Passwords never returned in API responses
- Password hash never exposed in any endpoint
- Rate limiting on login attempts

## Authorization

### Role-Based Access Control (RBAC)

**Roles:**
- `STUDENT` - Standard user with access to learning features
- `ADMIN` - Administrative access to content management

**Implementation:**
- Spring Security with `@PreAuthorize` annotations
- Method-level security on controllers
- Resource ownership validation

**Examples:**
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createExam() { ... }

@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<?> attemptTest() { ... }

@PreAuthorize("@securityService.isAttemptOwner(#attemptId)")
public ResponseEntity<?> submitTest(@PathVariable Long attemptId) { ... }
```

### Resource Ownership

Users can only access their own resources:
- Test attempts
- Bookmarks
- Study plans
- Notifications
- Performance data

**Validation:**
```java
if (!attempt.getUser().getId().equals(currentUserId)) {
    throw new ForbiddenException("Access denied");
}
```

## Anti-Cheating Measures

### 1. Server-Authoritative Timer

**Implementation:**
- Test expiration time calculated on server: `expiresAt = startedAt + durationMinutes`
- Frontend displays countdown based on `expiresAt`
- Backend validates time on submission
- If `currentTime > expiresAt`, attempt is marked as EXPIRED

**Why:** Client-side timer can be manipulated; server time cannot.

### 2. Server-Side Score Calculation

**Implementation:**
```java
// Backend calculates score
int correct = 0;
int wrong = 0;
double score = 0;

for (Answer answer : answers) {
    if (answer.isCorrect()) {
        correct++;
        score += question.getMarks();
    } else if (answer.getSelectedOptionId() != null) {
        wrong++;
        score -= question.getNegativeMarks();
    }
}
```

**Why:** Client cannot be trusted to calculate scores accurately.

### 3. Answer Key Protection

**Implementation:**
- `Option.isCorrect` NEVER sent during active test
- Correct answers only revealed after submission
- Test questions do not include solution during attempt

### 4. Attempt Ownership Validation

**Implementation:**
```java
@PreAuthorize("@securityService.isAttemptOwner(#attemptId)")
```

**Why:** Prevent users from accessing or modifying others' attempts.

### 5. No Duplicate Submissions

**Implementation:**
```java
if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
    throw new BadRequestException("Test already submitted");
}
```

### 6. Question Belongs to Test Validation

**Implementation:**
```java
if (!testContainsQuestion(testId, questionId)) {
    throw new BadRequestException("Invalid question for this test");
}
```

**Why:** Prevent submitting answers to questions not in the test.

## Input Validation

### Backend Validation (Jakarta Bean Validation)

```java
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
    private String password;
}
```

### Frontend Validation (Zod)

```typescript
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match"
});
```

**Why Both:** Frontend for UX, backend for security.

## SQL Injection Prevention

**Implementation:**
- Spring Data JPA with parameterized queries
- Never concatenate user input into SQL
- Use `@Query` with named parameters

**Safe:**
```java
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);
```

**Unsafe (Never do this):**
```java
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
```

## CORS (Cross-Origin Resource Sharing)

**Configuration:**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        env.getProperty("cors.allowed-origins").split(",")
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    return source;
}
```

**Environment-Specific:**
- Development: `http://localhost:3000,http://localhost:3001`
- Production: `https://rapidstudy.com,https://admin.rapidstudy.com`

## Rate Limiting

**Implementation:** Bucket4j or Redis-based rate limiter

**Limits:**
- Login: 5 attempts per minute per IP
- Registration: 3 attempts per hour per IP
- API calls: 200 requests per minute per user
- AI endpoints: 10 requests per minute per user

**Why:** Prevent brute force, DDoS, and abuse.

## Secure Headers

**Implemented Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## File Upload Security

**Validation:**
- File extension whitelist: `.csv`, `.xlsx`
- MIME type validation
- File size limit: 10MB
- Virus scanning (future enhancement)
- Never execute uploaded files
- Store in isolated directory

**Implementation:**
```java
public void validateFile(MultipartFile file) {
    String filename = file.getOriginalFilename();
    String extension = getExtension(filename);
    
    if (!ALLOWED_EXTENSIONS.contains(extension)) {
        throw new BadRequestException("Invalid file type");
    }
    
    if (file.getSize() > MAX_FILE_SIZE) {
        throw new BadRequestException("File too large");
    }
    
    // Validate MIME type
    String contentType = file.getContentType();
    if (!ALLOWED_MIME_TYPES.contains(contentType)) {
        throw new BadRequestException("Invalid file format");
    }
}
```

## Logging and Monitoring

### What to Log
- Authentication attempts (success/failure)
- Authorization failures
- Suspicious activity (multiple failed logins)
- API errors (500 errors)
- Admin actions

### What NOT to Log
- Passwords (plain or hashed)
- JWT tokens
- Sensitive user data
- Credit card information (if added in future)

### Log Format
```
[TIMESTAMP] [LEVEL] [USER_ID] [IP] [ACTION] [DETAILS]
```

## Data Privacy

### Personal Data Protection
- Email addresses encrypted at rest (future)
- Phone numbers masked in logs
- User data only accessible by user or admin
- Data deletion capability (GDPR compliance)

### Data Retention
- User data: Retained until account deletion
- Test attempts: Retained indefinitely for analytics
- Logs: Retained for 90 days

## HTTPS/TLS

**Production Requirements:**
- TLS 1.2 or higher
- Valid SSL certificate (Let's Encrypt)
- HTTP redirects to HTTPS
- HSTS header enabled

## Security Testing

### Automated Testing
- Unit tests for authorization logic
- Integration tests for authentication flow
- SQL injection prevention tests
- XSS prevention tests

### Manual Testing
- Penetration testing before production
- Security audit of dependencies
- Code review for security issues

## Dependency Management

**Tools:**
- OWASP Dependency-Check
- Snyk
- npm audit / mvn dependency:check

**Process:**
- Regular dependency updates
- Security advisory monitoring
- Immediate patching of critical vulnerabilities

## Security Incident Response

### Process
1. Detect and assess incident
2. Contain the breach
3. Investigate root cause
4. Remediate vulnerabilities
5. Document and learn
6. Notify affected users (if required)

## Security Checklist

### Pre-Launch
- [ ] All endpoints have proper authentication
- [ ] All endpoints have proper authorization
- [ ] Passwords are BCrypt hashed
- [ ] JWT tokens are secure and short-lived
- [ ] Input validation on all endpoints
- [ ] SQL injection tests pass
- [ ] XSS prevention implemented
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Secure headers configured
- [ ] HTTPS enabled
- [ ] File upload validation
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured properly
- [ ] Dependencies up to date
- [ ] Security tests passing

### Ongoing
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log monitoring
- [ ] Incident response plan tested
- [ ] Backup and recovery tested

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21  
**Security Contact:** security@rapidstudy.com
