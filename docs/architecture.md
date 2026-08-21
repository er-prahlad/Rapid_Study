# RapidStudy - Architecture Documentation

## System Architecture

### Overview
RapidStudy follows a modern, layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│  (Next.js Web + Next.js Admin + Android)    │
└───────────────────┬─────────────────────────┘
                    │ HTTPS/REST
┌───────────────────▼─────────────────────────┐
│         Application Layer                    │
│         (Spring Boot REST API)               │
│  ┌──────────────────────────────────────┐   │
│  │ Controllers → Services → Repositories │   │
│  └──────────────────────────────────────┘   │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │                       │
┌───────▼────────┐     ┌────────▼──────┐
│  Data Layer    │     │  Cache Layer  │
│  (MySQL 8)     │     │  (Redis 7)    │
└────────────────┘     └───────────────┘
```

## Technology Choices

### Backend: Java 21 + Spring Boot
**Why:**
- Mature ecosystem with proven production reliability
- Strong type safety and compile-time error detection
- Excellent Spring Security for authentication/authorization
- Rich data access with Spring Data JPA
- Easy integration with MySQL and Redis

### Frontend: Next.js + TypeScript
**Why:**
- Server-side rendering for better SEO and performance
- TypeScript for type safety and better developer experience
- Modern React ecosystem with excellent tooling
- API routes for backend-for-frontend patterns if needed

### Mobile: Kotlin + Jetpack Compose
**Why:**
- Modern Android development standard
- Declarative UI with Compose
- Null safety and concise syntax
- Excellent coroutines for async operations

### Database: MySQL 8
**Why:**
- Proven relational database for complex queries
- ACID compliance for financial/score data
- Excellent JSON support for flexible fields
- Wide industry adoption and support

### Cache: Redis
**Why:**
- In-memory performance for leaderboards
- Sorted sets perfect for ranking systems
- TTL support for temporary data
- Pub/sub for future real-time features

## Design Principles

### 1. Server-Authoritative
All critical business logic runs on the backend:
- Score calculation
- Test timing and expiration
- Answer validation
- User authentication

**Why:** Prevent cheating, manipulation, and ensure data integrity.

### 2. Single Source of Truth
The Spring Boot backend is the only source of truth. Web and mobile clients are thin presentation layers.

### 3. API-First Design
RESTful APIs designed before implementation, documented with OpenAPI/Swagger.

### 4. Stateless Authentication
JWT tokens for scalable, stateless authentication.

### 5. Defense in Depth
Multiple layers of security:
- Input validation (client + server)
- Authentication (JWT)
- Authorization (role-based)
- Rate limiting
- SQL injection prevention
- XSS prevention

## Component Architecture

### Backend Structure
```
com.rapidstudy
├── config/              # Configuration classes
├── controller/          # REST controllers (thin)
├── dto/                 # Data transfer objects
├── entity/              # JPA entities
├── enums/               # Enumerations
├── exception/           # Custom exceptions and handlers
├── mapper/              # DTO ↔ Entity mappers
├── repository/          # Data access layer
├── security/            # Security configuration, JWT
├── service/             # Business logic (thick)
└── util/                # Utility classes
```

### Frontend Structure
```
frontend/
├── app/                 # Next.js app directory
│   ├── (auth)/         # Auth routes
│   ├── (student)/      # Student routes
│   └── api/            # API routes (if needed)
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   └── ...
├── lib/                 # Utilities
├── services/            # API client layer
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
└── locales/             # i18n translations
```

### Android Structure
```
android/app/src/main/java/com/rapidstudy/
├── data/
│   ├── api/            # Retrofit services
│   ├── model/          # Data models
│   └── repository/     # Repository pattern
├── ui/
│   ├── screens/        # Compose screens
│   ├── components/     # Reusable components
│   └── theme/          # Material theme
├── viewmodel/          # ViewModels (MVVM)
└── util/               # Utilities
```

## Communication Patterns

### Request Flow
```
User Action → Frontend/Android
     ↓
API Call (Axios/Retrofit)
     ↓
Spring Boot Controller
     ↓
Service Layer (Business Logic)
     ↓
Repository Layer (Data Access)
     ↓
Database/Cache
```

### Authentication Flow
```
1. User submits credentials
2. Backend validates against database
3. Backend generates JWT token
4. Client stores token (secure storage)
5. Client includes token in Authorization header
6. Backend validates token on each request
7. Backend extracts user context from token
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT) allows multiple instances
- Load balancer in front of Spring Boot instances
- Shared MySQL and Redis

### Caching Strategy
- Redis for frequently accessed data (leaderboards, popular tests)
- HTTP caching headers for static content
- Database query optimization with indexes

### Database Optimization
- Proper indexing on foreign keys and query fields
- Pagination for large result sets
- Connection pooling (HikariCP)
- Read replicas for future growth

## Security Architecture

### Authentication
- JWT with short expiration (1 day)
- Refresh tokens (7 days)
- BCrypt password hashing (strength 12)
- Secure token storage

### Authorization
- Role-based access control (RBAC)
- Method-level security with @PreAuthorize
- Resource ownership validation

### Anti-Cheating Measures
- Server-controlled test timer
- Server-side score calculation
- No answer keys during active tests
- Attempt ownership validation
- Request rate limiting

## Error Handling

### Global Exception Handler
Catches all exceptions and returns consistent error response:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "timestamp": "2026-08-21T10:30:00Z",
  "path": "/api/tests/123"
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict (duplicate resource)
- 422: Unprocessable entity
- 429: Too many requests
- 500: Internal server error

## Monitoring and Observability

### Health Checks
- Spring Boot Actuator endpoints
- Database connection health
- Redis connection health

### Logging
- Structured logging with SLF4J + Logback
- Different log levels per environment
- No sensitive data in logs (passwords, tokens)

## Deployment Architecture

### Development
```
Docker Compose:
- mysql:8
- redis:7
- (backend runs locally with mvnw)
- (frontend runs locally with npm)
```

### Production
```
Docker Compose / Kubernetes:
- Nginx (reverse proxy, SSL termination)
- Spring Boot (multiple instances)
- MySQL (with persistent volume)
- Redis (with persistent volume)
- Frontend (static build served by Nginx)
- Admin (static build served by Nginx)
```

## Future Enhancements

- [ ] Microservices architecture (if scale demands)
- [ ] Elasticsearch for advanced search
- [ ] Kafka for event-driven architecture
- [ ] Read replicas for database
- [ ] CDN for static assets
- [ ] Real-time features with WebSocket
- [ ] Mobile push notifications
- [ ] Email service integration

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21
