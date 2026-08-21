# RapidStudy

**Tagline:** Prepare • Practice • Perform

A production-quality competitive exam preparation platform for Indian students preparing for SSC, UPSC, BPSC, Railway, Banking, and other competitive exams.

---

## 🎯 Features

### For Students
- 📝 **Mock Tests** - Timed, server-controlled competitive exam simulations
- 💪 **Practice Mode** - Subject-wise, topic-wise, and difficulty-based practice
- 📊 **Performance Analytics** - Detailed analysis with charts and insights
- 🏆 **Leaderboard** - Daily, weekly, monthly, and all-time rankings
- 🔖 **Bookmarks** - Save important questions for revision
- 📅 **Study Plans** - Create and track personalized study schedules
- 🔔 **Notifications** - Stay updated with reminders and announcements
- 🤖 **AI Doubt Solver** - Get AI-powered explanations (optional)
- 🌐 **Multi-language** - Hindi, English, and Hineng support
- 📱 **Android App** - Full-featured mobile experience

### For Admins
- 👥 **User Management** - Manage students and roles
- 📚 **Content Management** - Create and manage exams, subjects, topics
- ❓ **Question Bank** - Add, edit, import questions (CSV/XLSX)
- 📝 **Test Builder** - Create custom mock tests with flexible configuration
- 🤖 **AI Question Generator** - Generate questions with AI (requires approval)
- 📈 **Analytics Dashboard** - Platform-wide insights and statistics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Client Applications           │
├──────────────┬──────────────┬───────────┤
│   Next.js    │   Next.js    │  Android  │
│  (Frontend)  │   (Admin)    │  (Kotlin) │
└──────┬───────┴──────┬───────┴─────┬─────┘
       │              │             │
       └──────────────┼─────────────┘
                      │
              ┌───────▼────────┐
              │  Spring Boot   │
              │   REST API     │
              └───────┬────────┘
                      │
         ┌────────────┼────────────┐
         │                         │
    ┌────▼─────┐            ┌─────▼────┐
    │  MySQL   │            │  Redis   │
    │ Database │            │  Cache   │
    └──────────┘            └──────────┘
```

### Key Principles
- **Server-Authoritative:** All critical operations (scoring, timing, authentication) controlled by backend
- **Single Source of Truth:** Spring Boot backend serves both web and mobile
- **Real-time Performance:** Redis caching for leaderboards and frequently accessed data
- **Secure by Design:** JWT authentication, BCrypt hashing, role-based access control

---

## 🛠️ Technology Stack

### Backend
- Java 21
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA + Hibernate
- MySQL 8
- Redis
- Flyway (Database Migrations)
- Maven

### Frontend (Student Web App)
- Next.js 14+
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form + Zod

### Admin Panel
- Next.js 14+ (separate deployment)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Android
- Kotlin
- Jetpack Compose
- MVVM Architecture
- Retrofit + OkHttp
- Coroutines
- Navigation Compose

### DevOps
- Docker + Docker Compose
- Nginx
- MySQL 8
- Redis 7

---

## 📁 Project Structure

```
rapidstudy/
├── backend/              # Spring Boot REST API
├── frontend/             # Next.js student web app
├── admin/                # Next.js admin panel
├── android/              # Kotlin Android app
├── database/             # Flyway migrations and seeds
├── docker/               # Docker configurations
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── .env.example          # Environment variables template
├── docker-compose.yml    # Development compose
├── docker-compose.prod.yml # Production compose
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (for backend)
- **Node.js 18+** (for frontend/admin)
- **Docker & Docker Compose** (for MySQL, Redis)
- **Android Studio** (for Android development)
- **Git**

### Installation

#### 1. Clone the Repository

```powershell
git clone <repository-url>
cd rapidstudy
```

#### 2. Set Up Environment Variables

```powershell
copy .env.example .env
```

Edit `.env` and fill in your configuration values.

#### 3. Start Infrastructure (MySQL + Redis)

```powershell
docker compose up -d
```

Verify services are running:

```powershell
docker compose ps
```

#### 4. Start Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend will run on `http://localhost:8080`

#### 5. Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 6. Start Admin Panel

```powershell
cd admin
npm install
npm run dev
```

Admin will run on `http://localhost:3001`

#### 7. Open Android Project

```powershell
cd android
.\gradlew.bat assembleDebug
```

Or open the `android/` folder in Android Studio.

---

## 🧪 Testing

### Backend Tests

```powershell
cd backend
.\mvnw.cmd test
```

### Frontend Tests

```powershell
cd frontend
npm test
```

### Android Tests

```powershell
cd android
.\gradlew.bat test
```

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database.md)
- [API Documentation](docs/api.md)
- [Security](docs/security.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](docs/testing.md)

API documentation (Swagger) is available at:  
`http://localhost:8080/swagger-ui.html` (when backend is running)

---

## 🐳 Docker Deployment

### Development

```powershell
docker compose up -d
```

### Production

```powershell
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security

- **JWT Authentication** with secure token management
- **BCrypt Password Hashing**
- **Role-Based Access Control (RBAC)**
- **CORS Protection**
- **Rate Limiting**
- **Input Validation** (frontend + backend)
- **SQL Injection Prevention**
- **Server-Side Score Calculation** (anti-cheating)
- **Server-Controlled Timer** (anti-cheating)

---

## 🌐 Supported Exams

- SSC CGL
- SSC CHSL
- BPSC
- UPSC CSE
- Railway
- Bank PO
- More exams can be added through admin panel

---

## 🌍 Language Support

- 🇬🇧 English
- 🇮🇳 Hindi
- 🔄 Hineng (Hindi + English mix)

---

## 📱 Mobile App

Android app with full feature parity to the web application. Built with Kotlin and Jetpack Compose for modern, native performance.

---

## 🤝 Contributing

(Guidelines to be added)

---

## 📄 License

(License to be decided)

---

## 📞 Support

(Support channels to be added)

---

**Built with ❤️ for Indian competitive exam aspirants**
