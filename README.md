# 🎓 RapidStudy

**Prepare • Practice • Perform**

India ke competitive exam students ke liye ek complete preparation platform.

---

## 📱 Supported Exams
SSC CGL · SSC CHSL · UPSC CSE · BPSC · Railway · Bank PO

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.2, MySQL 8, Redis 7, JWT |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Android | Kotlin, Jetpack Compose, MVVM, Retrofit |
| DevOps | Docker, Nginx |

---

## 🚀 Quick Start (Development)

### Prerequisites
- Java 21
- Node.js 18+
- Docker (MySQL + Redis ke liye)

### 1. Database start karo
```powershell
docker compose up -d
```

### 2. Backend start karo
```powershell
cd backend
.\run.ps1
# URL: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### 3. Frontend start karo
```powershell
cd frontend
npm install
npm run dev
# URL: http://localhost:3000
```

### 4. Android
- Android Studio mein `android/` folder open karo
- Build → Run

---

## 📡 API Documentation

Backend chal raha ho tab: **http://localhost:8080/swagger-ui.html**

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register karo |
| POST | `/api/v1/auth/login` | Login karo |
| GET | `/api/v1/student/dashboard` | Dashboard data |
| GET | `/api/v1/exams` | Exams list |
| GET | `/api/v1/tests` | Mock tests |
| POST | `/api/v1/tests/{id}/attempts` | Test start karo |
| POST | `/api/v1/attempts/{id}/submit` | Submit (server scoring) |
| GET | `/api/v1/leaderboard` | Leaderboard |

---

## 🔐 Default Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rapidstudy.in | Admin@1234 |

> ⚠️ **PRODUCTION MEIN CHANGE KARO!**

---

## 🐳 Production Deploy

```bash
# .env file mein production values set karo
cp .env.example .env

# Production stack start karo
docker compose -f docker-compose.prod.yml up -d
```

---

## 📁 Project Structure

```
rapidstudy/
├── backend/          # Spring Boot API
├── frontend/         # Next.js Web App
├── android/          # Kotlin + Compose App
├── docker/           # Nginx configs
├── scripts/          # Database scripts
└── docs/             # Documentation
```

---

## 🛡️ Security Features

- ✅ JWT authentication (jjwt 0.12.x)
- ✅ BCrypt password hashing
- ✅ Role-based access control (STUDENT / ADMIN)
- ✅ Server-authoritative test timer
- ✅ Server-side score calculation
- ✅ Rate limiting (Redis-backed)
- ✅ CORS configuration
- ✅ Secure headers (HSTS, X-Frame-Options)
- ✅ File upload validation
- ✅ No answer keys during active test

---

## 📊 Features

- 📝 Mock Tests with server timer
- 📚 Practice Questions (Easy/Medium/Hard)
- 📈 Performance Analytics & Charts
- 🏆 Redis-cached Leaderboard
- 🔖 Bookmarks
- 📅 Study Plans
- 🔔 Notifications
- 🤖 AI Doubt Solver (optional)
- 🌐 Hindi + English support
- 📱 Android App (Jetpack Compose)

---

*Made with ❤️ for Indian students*
