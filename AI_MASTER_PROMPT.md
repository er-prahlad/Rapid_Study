# RapidStudy - AI Master Prompt

## Project Overview
**RapidStudy** is a production-quality competitive exam preparation platform for Indian students.

**Tagline:** Prepare • Practice • Perform

## Core Information

### Technology Stack
- **Backend:** Java 21, Spring Boot 3.x, MySQL 8, Redis, JWT
- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Admin:** Next.js (separate deployment)
- **Android:** Kotlin, Jetpack Compose, MVVM
- **DevOps:** Docker, Docker Compose, Nginx

### Architecture Principles
1. Spring Boot is the central backend
2. MySQL is the primary database
3. Redis is the caching layer
4. Next.js web app and Android app communicate ONLY with Spring Boot
5. Never trust client-side calculations for business logic
6. Server-authoritative for all critical operations (scoring, timing, authentication)

### Supported Exams
- SSC CGL, SSC CHSL
- BPSC, UPSC CSE
- Railway, Bank PO
- Other competitive exams (extensible architecture)

### Language Support
- English, Hindi, Hineng (Hindi+English mix)

### User Roles
- STUDENT
- ADMIN (separate domain deployment)

## Key Features
- Mock tests with server-controlled timer
- Practice questions with detailed explanations
- Previous year papers
- Performance analytics with charts
- Leaderboard (Redis-cached)
- Bookmarks and study plans
- Notifications
- AI doubt solver (optional, with fallback)
- AI question generator (admin approval required)
- Hindi + English support
- Question import (CSV/XLSX)

## Security Requirements
- JWT authentication with BCrypt
- Role-based authorization
- Server-side validation
- No answer keys during active tests
- Server calculates all scores
- CORS, rate limiting, secure headers
- Prevent IDOR, SQL injection, score manipulation

## Monorepo Structure
```
rapidstudy/
├── backend/          # Spring Boot
├── frontend/         # Next.js (student web app)
├── admin/            # Next.js (admin panel, separate domain)
├── android/          # Kotlin + Compose
├── database/         # Flyway migrations, seeds
├── docker/           # Dockerfiles
├── docs/             # Documentation
├── scripts/          # Utility scripts
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
├── README.md
├── AI_MASTER_PROMPT.md
└── TASK_STATUS.md
```

## Development Workflow
- **Phase-by-phase implementation** (mandatory)
- After each phase: build, test, verify, report
- Never skip phases
- Never implement all phases at once
- Quality > Speed
- Production architecture > Quick demo

## Windows Development Support
Use Windows-compatible commands:
- PowerShell: `docker compose up -d`
- Backend: `.\mvnw.cmd spring-boot:run`
- Frontend: `npm run dev`
- Android: `.\gradlew.bat assembleDebug`

## Critical Rules
1. **Build from scratch** - no assumptions about existing systems
2. **Server-authoritative** - never trust client for critical logic
3. **Phase-by-phase** - complete one phase before moving to next
4. **No hardcoded secrets** - use environment variables
5. **Real data, real APIs** - no fake/mock systems in production
6. **Reusable code** - no duplication between web and Android
7. **Extensible architecture** - easy to add new exams/features

## Anti-Patterns to Avoid
❌ Calculating scores on frontend
❌ Revealing answers during active tests
❌ Client-controlled test timers
❌ Hardcoded production data
❌ Duplicate business logic for web/Android
❌ Skipping phases
❌ Moving forward with broken builds
❌ Trusting client-submitted scores

## Acceptance Criteria Summary
The project is complete only when ALL of these work:
- ✓ Full authentication (JWT + BCrypt)
- ✓ Complete test engine (server-authoritative)
- ✓ Score calculation (server-side)
- ✓ Admin panel (separate domain)
- ✓ Android app (full feature parity)
- ✓ Docker deployment (production-ready)
- ✓ Hindi + English support
- ✓ AI integration (with fallback)
- ✓ Comprehensive tests
- ✓ Full documentation

---

**This document is the permanent context for AI assistants working on RapidStudy.**
