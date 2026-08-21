# RapidStudy - Development Environment Setup

## Prerequisites Verification

### ✅ Verified on this system:
- **Docker:** 29.7.2 ✓
- **Docker Compose:** v5.4.0 ✓
- **Java:** 21.0.1 LTS ✓
- **Node.js:** 22.13.0 ✓
- **npm:** 10.9.2 ✓

---

## Quick Start

### 1. Infrastructure Setup

#### Start Redis (Docker)
```powershell
docker ps --filter "name=rapidstudy-redis"
```

If not running:
```powershell
docker run -d --name rapidstudy-redis -p 6379:6379 redis:7-alpine redis-server --appendonly yes
```

#### MySQL Setup
We're using the local MySQL installation on port 3306.

**Create Database:**
```powershell
.\scripts\setup-database.ps1
```

Or manually run:
```sql
CREATE DATABASE rapidstudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rapidstudy_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON rapidstudy.* TO 'rapidstudy_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 2. Backend Setup (Spring Boot)

**Set JAVA_HOME:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
```

**Build Backend:**
```powershell
cd backend
.\build.ps1
```

Or manually:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd clean install -DskipTests
```

**Run Backend:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd spring-boot:run
```

Backend will run on: `http://localhost:8080`

---

### 3. Frontend Setup (Student App)

**Install Dependencies:**
```powershell
cd frontend
npm install
```

**Run Development Server:**
```powershell
npm run dev
```

Frontend will run on: `http://localhost:3000`

**Build for Production:**
```powershell
npm run build
npm run start
```

---

### 4. Admin Setup

**Install Dependencies:**
```powershell
cd admin
npm install
```

**Run Development Server:**
```powershell
npm run dev
```

Admin will run on: `http://localhost:3001`

**Build for Production:**
```powershell
npm run build
npm run start
```

---

### 5. Android Setup

1. Open Android Studio
2. Open folder: `android/`
3. Wait for Gradle sync
4. Click Run

Or via command line:
```powershell
cd android
.\gradlew.bat assembleDebug
```

---

## Verification

### Check Services

**Redis:**
```powershell
docker exec rapidstudy-redis redis-cli ping
# Should return: PONG
```

**MySQL:**
```powershell
mysql -u rapidstudy_user -p rapidstudy -e "SELECT 1;"
# Password: password
```

**Backend Health:**
```powershell
curl http://localhost:8080/actuator/health
```

**Frontend:**
```powershell
curl http://localhost:3000
```

**Admin:**
```powershell
curl http://localhost:3001
```

---

## Environment Variables

Copy `.env.example` to `.env` and update values:

```powershell
Copy-Item .env.example .env
```

**Key Variables:**
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_NAME=rapidstudy`
- `DB_USERNAME=rapidstudy_user`
- `DB_PASSWORD=password`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`
- `JWT_SECRET=<generate-secure-random-string>`

---

## Common Issues

### Maven Wrapper Issues

If `mvnw.cmd` fails, ensure JAVA_HOME is set:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
```

### Port Already in Use

**Check what's using a port:**
```powershell
netstat -ano | findstr :3306
netstat -ano | findstr :6379
netstat -ano | findstr :8080
```

**Kill process:**
```powershell
taskkill /PID <pid> /F
```

### MySQL Port Conflict

If port 3306 is occupied by local MySQL, we use it directly instead of Docker MySQL.

### NPM Install Slow

First-time npm install can take 2-5 minutes. This is normal.

---

## Project Structure

```
rapidstudy/
├── backend/          # Spring Boot API (port 8080)
├── frontend/         # Next.js Student App (port 3000)
├── admin/            # Next.js Admin Panel (port 3001)
├── android/          # Kotlin Android App
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── docker-compose.yml
```

---

## Development Workflow

1. **Start Infrastructure:**
   - Redis (Docker)
   - MySQL (local)

2. **Start Backend:**
   ```powershell
   cd backend
   .\build.ps1  # First time only
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
   .\mvnw.cmd spring-boot:run
   ```

3. **Start Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

4. **Start Admin:**
   ```powershell
   cd admin
   npm run dev
   ```

5. **Open in browser:**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3001
   - API: http://localhost:8080
   - Swagger: http://localhost:8080/swagger-ui.html

---

## Next Steps

After setup, proceed to **PHASE 2: Docker MySQL + Redis Configuration** or start implementing features from **PHASE 3: Spring Boot Foundation**.

See `TASK_STATUS.md` for current progress.
