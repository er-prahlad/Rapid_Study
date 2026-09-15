# 🎓 RapidStudy — Competitive Exam Preparation Platform

**Prepare • Practice • Perform**

RapidStudy is a comprehensive, enterprise-grade competitive examination preparation and testing platform engineered specifically for students preparing for high-stakes Indian exams including **SSC CGL**, **SSC CHSL**, **UPSC CSE**, **BPSC**, **Railway (RRB NTPC/Group D)**, and **Banking (IBPS/SBI PO & Clerk)**.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [Requirements & Prerequisites](#-requirements--prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Docker Configuration](#-docker-configuration)
7. [Frontend Application](#-frontend-application)
8. [Backend REST API](#-backend-rest-api)
9. [Android Application](#-android-application)
10. [Database & Migrations](#-database--migrations)
11. [Environment Variables](#-environment-variables)
12. [Testing Strategy](#-testing-strategy)
13. [Production Deployment](#-production-deployment)
14. [Swagger / OpenAPI Documentation](#-swagger--openapi-documentation)
15. [Git Workflow](#-git-workflow)

---

## 🌟 Project Overview

RapidStudy provides an end-to-end ecosystem that simulates real exam hall environments with sub-millisecond responsiveness, cheat prevention, and AI-driven personalized learning paths:
- **Server-Authoritative Test Engine**: Timers, scoring, and question states are completely calculated and validated on the backend.
- **Multilingual Delivery**: Complete interface and content support for English and Hindi.
- **Cross-Platform Access**: Responsive Next.js 14 Web Portal, dedicated Next.js Admin CMS, and a native Kotlin Jetpack Compose Android app.
- **Deep Analytics**: Real-time performance tracking by topic, difficulty, accuracy, and time spent.

---

## ⚡ Features

### 🎓 Student Experience
- **Interactive Mock Tests**: Authentic exam conditions with live section switching, color-coded question palette (Visited, Answered, Marked for Review, Answered & Marked), and instant server synchronization.
- **Adaptive Practice Engine**: Topic-wise and difficulty-wise (Easy, Medium, Hard) practice sessions with immediate solution explanations and previous mistake revisit mode.
- **Detailed Result & Analytics**: Sectional score cards, negative marks breakdown, time-management graphs, and topic weakness radar.
- **Live Leaderboards**: Daily, weekly, monthly, and all-time student rankings powered by Redis caching.
- **Personalized Study Plans**: Customizable milestone-driven preparation schedules.
- **Question Bookmarks & Revision**: Save tricky questions with personal notes for swift revision.
- **Notification System**: Instant alerts for newly published tests, exam schedule updates, and milestone achievements.
- **AI-Powered Doubt Solver & Recommendations**: Instant step-by-step problem explanations, automated question generation, and tailored study recommendations with fallback to rule-based logic.

### 🛡️ Admin & Operational Capabilities
- **Question Bank CMS**: Rich-text questions with mathematical equations, LaTeX support, multiple options, and detailed solutions.
- **Bulk Question Import**: Automated XLSX and CSV importer with validation for duplicate detection and schema validation.
- **Mock Test Builder**: Multi-subject test composition, question shuffling, differential positive/negative marking schemes, and publish/unpublish workflows.
- **User & Security Management**: Role-based access control (RBAC), user activation/deactivation, and role assignments.
- **Platform Analytics**: Comprehensive metrics on student engagement, popular exams, and test completion rates.

---

## 🏛️ Architecture

RapidStudy implements a clean, decoupled 3-tier microservice-ready architecture:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             Client Layer                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Next.js 14 Web App     │  │   Android App (Kotlin + Compose)     │  │
│  │  (Tailwind + TanStack)   │  │   (Retrofit + Coroutines + MVVM)     │  │
│  └────────────┬─────────────┘  └──────────────────┬───────────────────┘  │
└───────────────┼───────────────────────────────────┼──────────────────────┘
                │ HTTPS / REST (JSON)               │
┌───────────────▼───────────────────────────────────▼──────────────────────┐
│                    Gateway & Reverse Proxy (Nginx)                       │
│      - SSL Termination    - Gzip / Brotli    - Static File Serving       │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │ Reverse Proxy
┌───────────────────────────────────▼──────────────────────────────────────┐
│                    Application Layer (Spring Boot 3.2)                   │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌──────────────────┐  │
│  │   Spring Security     │  │   Service Layer   │  │ Test Engine Core │  │
│  │   JWT + Rate Limiter  │  │   Business Logic  │  │ Server Timer     │  │
│  └───────────────────────┘  └───────────────────┘  └──────────────────┘  │
└───────────────────┬───────────────────────────────┬──────────────────────┘
                    │ JDBC / HikariCP               │ Redis Protocol
┌───────────────────▼───────────┐       ┌───────────▼──────────────────────┐
│       Database (MySQL 8)      │       │        Cache (Redis 7)           │
│  - 14 Normalized Tables       │       │  - Leaderboard ZSETs             │
│  - 20 Flyway Migrations       │       │  - Session & Rate Limit Buckets  │
│  - Indexed Foreign Keys       │       │  - Exam & Test Metadata Caching  │
└───────────────────────────────┘       └──────────────────────────────────┘
```

---

## 💻 Requirements & Prerequisites

Ensure the following tools are installed on your workstation:
- **Java Development Kit (JDK)**: Java 21 LTS (Oracle OpenJDK or Eclipse Temurin)
- **Node.js**: Node.js v18.17+ or v20+ LTS with npm 9+
- **Docker & Docker Compose**: Docker Engine 24+ / Docker Desktop 4.20+
- **MySQL Client / Database**: MySQL 8.0+ (or run via Docker)
- **Redis Server**: Redis 7.0+ (or run via Docker)
- **Android Studio** (for mobile): Android Studio Iguana / Jellyfish with Android SDK 34

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/er-prahlad/Rapid_Study.git
cd Rapid_Study
```

### 2. Environment Configuration
Copy the example environment file and adjust credentials if needed:
```powershell
cp .env.example .env
```

### 3. Launch Databases via Docker
Start MySQL 8 and Redis 7 containers in detached mode:
```powershell
docker compose up -d
```
Verify containers are healthy:
```powershell
docker compose ps
```

---

## 🐳 Docker Configuration

RapidStudy provides two complete container configurations:

### Development Setup (`docker-compose.yml`)
Runs MySQL 8 and Redis 7 with local port bindings for local development:
```yaml
services:
  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]
    environment:
      MYSQL_DATABASE: rapidstudy
      MYSQL_USER: rapidstudy_user
      MYSQL_PASSWORD: rapidstudy_password
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

### Production Full-Stack Setup (`docker-compose.prod.yml`)
Deploys the entire platform including Nginx reverse proxy, Spring Boot backend, Next.js frontend, MySQL, and Redis with health checks and restart policies:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🌐 Frontend Application

The frontend is built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **TanStack Query**.

### Features:
- Complete authentication flow (Login, Register, Password Reset)
- Interactive Exam Hall UI with countdown timer and question navigator
- Real-time performance dashboards with Recharts
- Responsive layout supporting Mobile, Tablet, and Desktop

### Running Frontend Locally:
```powershell
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

### Building for Production:
```powershell
npm run build
npm start
```

---

## ⚙️ Backend REST API

The backend is built with **Spring Boot 3.2**, **Java 21**, **Spring Security 6**, and **Spring Data JPA**.

### Key Modules:
- **Auth**: Stateless JWT (jjwt 0.12.x) with Access & Refresh tokens, BCrypt hashing.
- **Test Engine**: Server-authoritative timer, real-time question state management, atomic answer scoring.
- **Rate Limiting**: Redis-backed token bucket filter protecting authentication and AI endpoints.
- **Flyway Migrations**: Automated versioned schema management (V1 to V20).

### Compiling and Running Backend:
```powershell
cd backend
# Using Maven Wrapper
./mvnw clean compile
./mvnw spring-boot:run
```
Or use the workspace PowerShell automation:
```powershell
powershell.exe -ExecutionPolicy Bypass -File .\build_backend.ps1
```
The REST API starts on `http://localhost:8080`.

---

## 📱 Android Application

The mobile app is located in `android/` and engineered using modern Android standards:
- **Language**: Kotlin 1.9+
- **UI Framework**: Jetpack Compose with Material 3 Design
- **Architecture**: MVVM (Model-View-ViewModel) + StateFlow
- **Networking**: Retrofit 2 + OkHttp3 with AuthInterceptor
- **Local Storage**: DataStore / EncryptedSharedPreferences for JWT management

### Opening and Running Android:
1. Launch **Android Studio**.
2. Open the `Rapid_Study/android` directory.
3. Allow Gradle to sync dependencies.
4. Set backend IP in `RetrofitClient.kt` (e.g., `10.0.2.2:8080` for Android Emulator).
5. Click **Run** (`Shift + F10`).

---

## 🗄️ Database & Migrations

RapidStudy uses **MySQL 8** with **Flyway** for database migrations located in `backend/src/main/resources/db/migration`:

| Migration | Description |
|-----------|-------------|
| `V1__create_users_table.sql` | Users table, roles, credentials |
| `V2__create_exams_table.sql` | Supported competitive exams |
| `V3__create_subjects_table.sql` | Exam subjects |
| `V4__create_topics_table.sql` | Subject topics |
| `V5__create_questions_table.sql` | Question bank schema |
| `V6__create_options_table.sql` | MCQ options with correct flag |
| `V7__create_mock_tests_table.sql` | Test metadata, duration, marking scheme |
| `V8__create_mock_test_questions_table.sql` | Test-to-question mappings |
| `V9__create_test_attempts_table.sql` | Attempt lifecycle, timestamps, scores |
| `V10__create_attempt_answers_table.sql` | User answers and time spent |
| `V11__create_bookmarks_table.sql` | User question bookmarks |
| `V12__create_user_question_progress.sql`| Practice progress tracking |
| `V13__create_study_plans_table.sql` | Student study plan milestones |
| `V14__create_notifications_table.sql` | In-app alerts and announcements |
| `V15__align_attempt_status.sql` | Attempt status enum alignment |
| `V16__add_language_column.sql` | User multilingual preference |
| `V17__seed_data.sql` | Seed exams, subjects, topics, default admin |
| `V18__ai_question_generation.sql` | AI metadata columns for draft questions |
| `V19__fix_paper_year_type.sql` | Previous year papers year column fix |
| `V20__add_performance_indexes.sql` | High-traffic foreign key performance indexes |

---

## 🔐 Environment Variables

Key environment variables configured in `.env` (or OS environment):

| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| `PORT` | Backend server port | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev` / `prod`) | `dev` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | MySQL database name | `rapidstudy` |
| `DB_USERNAME` | MySQL database user | `rapidstudy_user` |
| `DB_PASSWORD` | MySQL password | `rapidstudy_password` |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis auth password | `""` |
| `JWT_SECRET` | 256-bit Base64 secret key for tokens | *Preconfigured dev key* |
| `JWT_EXPIRATION` | Access token lifetime (ms) | `86400000` (24h) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime (ms) | `604800000` (7d) |
| `CORS_ALLOWED_ORIGINS` | Allowed client origins | `http://localhost:3000` |
| `AI_ENABLED` | Toggle AI features (`true`/`false`) | `false` |
| `AI_API_KEY` | OpenAI / LLM API Key | `""` |
| `NEXT_PUBLIC_API_URL` | Backend URL for Next.js frontend | `http://localhost:8080` |

---

## 🧪 Testing Strategy

RapidStudy includes multi-level testing:
- **Backend Unit & Integration Tests**: Run using JUnit 5, Mockito, and Spring Boot Test.
  ```powershell
  cd backend
  ./mvnw test
  ```
- **Frontend Validation**: TypeScript compilation checks and component tests.
  ```powershell
  cd frontend
  npm run build
  ```
- **Security Tests**: Validation of IDOR guards, expired attempt rejections, server timer constraints, and rate limiting buckets.

Detailed test documentation is available at [`docs/testing.md`](docs/testing.md).

---

## 🚢 Production Deployment

### Quick Docker Production Rollout
```bash
# 1. Configure production environment
cp .env.example .env
# Edit .env with secure production passwords and secrets

# 2. Build and launch services
docker compose -f docker-compose.prod.yml up -d --build

# 3. Verify health
curl -f http://localhost/actuator/health
```

### Production Hardening Checklist:
1. Replace default JWT Secret with a cryptographically secure 512-bit key.
2. Update default Admin password (`admin@rapidstudy.in`).
3. Enforce HTTPS through SSL/TLS certificates (Let's Encrypt / Certbot).
4. Enable MySQL SSL mode (`DB_SSL=true`).
5. Configure Redis password protection.

Detailed deployment runbooks are in [`docs/deployment.md`](docs/deployment.md).

---

## 📖 Swagger / OpenAPI Documentation

Interactive OpenAPI 3.0 documentation is baked into the backend:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

The documentation includes complete schema definitions, error responses, query parameters, and JWT Bearer authorization testing tools.

---

## 🌿 Git Workflow

RapidStudy follows the standard GitFlow branching model:
- `main`: Production-ready code.
- `develop`: Integration branch for active features.
- `feature/*`: Dedicated branches for distinct features (`feature/auth`, `feature/exams`, `feature/questions`, etc.).

Detailed guidelines and commit conventions are in [`docs/git-workflow.md`](docs/git-workflow.md).

---

*Made with ❤️ for Indian competitive examination students.*
