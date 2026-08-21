# RapidStudy - Development Guide

## Development Environment Setup

### Prerequisites

1. **Java 21**
   ```powershell
   java -version
   # Should show Java 21
   ```

2. **Node.js 18+**
   ```powershell
   node --version
   npm --version
   ```

3. **Docker Desktop**
   ```powershell
   docker --version
   docker compose version
   ```

4. **Git**
   ```powershell
   git --version
   ```

5. **Android Studio** (for Android development)
   - Latest stable version
   - Android SDK 34+
   - Kotlin plugin

### Initial Setup

#### 1. Clone and Configure

```powershell
git clone <repository-url>
cd rapidstudy
copy .env.example .env
```

Edit `.env` with your local configuration.

#### 2. Start Infrastructure

```powershell
docker compose up -d
```

Verify services:
```powershell
docker compose ps
docker compose logs mysql
docker compose logs redis
```

#### 3. Backend Setup

```powershell
cd backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Backend will run on `http://localhost:8080`

Test:
```powershell
curl http://localhost:8080/actuator/health
```

#### 4. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 5. Admin Setup

```powershell
cd admin
npm install
npm run dev
```

Admin will run on `http://localhost:3001`

#### 6. Android Setup

Open `android/` folder in Android Studio, sync Gradle, and run on emulator or device.

---

## Development Workflow

### Branch Strategy

```
main              # Production-ready code
├── develop       # Integration branch
    ├── feature/auth
    ├── feature/exams
    ├── feature/mock-tests
    └── fix/bug-description
```

### Commit Convention

```
feat: add user authentication
fix: resolve test timer issue
docs: update API documentation
refactor: simplify score calculation
test: add unit tests for services
chore: update dependencies
```

### Feature Development Flow

1. **Create Feature Branch**
   ```powershell
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Develop**
   - Write code
   - Write tests
   - Run tests locally
   - Test integration

3. **Commit**
   ```powershell
   git add .
   git commit -m "feat: add my feature"
   ```

4. **Push**
   ```powershell
   git push origin feature/my-feature
   ```

5. **Create Pull Request**
   - Target: `develop` branch
   - Describe changes
   - Wait for review

---

## Backend Development

### Running Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

With specific profile:
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

### Database Migrations

Create new migration:
```powershell
# Create file: src/main/resources/db/migration/V{version}__{description}.sql
# Example: V15__add_user_preferences.sql
```

Apply migrations:
```powershell
.\mvnw.cmd flyway:migrate
```

Migration info:
```powershell
.\mvnw.cmd flyway:info
```

### Running Tests

All tests:
```powershell
.\mvnw.cmd test
```

Specific test:
```powershell
.\mvnw.cmd test -Dtest=AuthServiceTest
```

With coverage:
```powershell
.\mvnw.cmd test jacoco:report
```

### Building

```powershell
.\mvnw.cmd clean package
```

JAR file will be in `target/rapidstudy-backend-{version}.jar`

### API Documentation

Start backend and visit:
```
http://localhost:8080/swagger-ui.html
```

---

## Frontend Development

### Running Frontend

```powershell
cd frontend
npm run dev
```

### Building

```powershell
npm run build
npm run start  # Serve production build
```

### Linting

```powershell
npm run lint
```

### Testing

```powershell
npm test
```

### Adding UI Components

Using shadcn/ui:
```powershell
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

---

## Admin Development

Same as frontend (separate Next.js app):

```powershell
cd admin
npm run dev
npm run build
npm run lint
npm test
```

---

## Android Development

### Running on Emulator

```powershell
cd android
.\gradlew.bat assembleDebug
.\gradlew.bat installDebug
```

Or use Android Studio's Run button.

### Building APK

```powershell
.\gradlew.bat assembleRelease
```

APK location: `app/build/outputs/apk/release/`

### Running Tests

```powershell
.\gradlew.bat test
.\gradlew.bat connectedAndroidTest  # Instrumented tests
```

---

## Database Management

### Accessing MySQL

```powershell
docker compose exec mysql mysql -u rapidstudy_user -p rapidstudy
```

### MySQL Workbench Connection

- Host: `localhost`
- Port: `3306`
- Database: `rapidstudy`
- Username: From `.env`
- Password: From `.env`

### Backup Database

```powershell
docker compose exec mysql mysqldump -u rapidstudy_user -p rapidstudy > backup.sql
```

### Restore Database

```powershell
docker compose exec -T mysql mysql -u rapidstudy_user -p rapidstudy < backup.sql
```

---

## Redis Management

### Access Redis CLI

```powershell
docker compose exec redis redis-cli
```

### Common Redis Commands

```redis
KEYS *                    # List all keys
GET key_name              # Get value
DEL key_name              # Delete key
FLUSHALL                  # Clear all data (careful!)
INFO                      # Server info
```

---

## Debugging

### Backend Debugging

IntelliJ IDEA:
1. Set breakpoints
2. Run → Debug 'RapidStudyApplication'

VS Code:
1. Install Java extension pack
2. Set breakpoints
3. F5 to debug

### Frontend Debugging

Browser DevTools:
- F12 to open DevTools
- Sources tab → Set breakpoints
- Console for logs

VS Code:
- Chrome Debugger extension
- Launch configuration in `.vscode/launch.json`

### Android Debugging

Android Studio:
- Set breakpoints in Kotlin code
- Debug button (bug icon)
- Logcat for logs

---

## Troubleshooting

### Backend won't start

1. Check if MySQL is running:
   ```powershell
   docker compose ps
   ```

2. Check MySQL connection in `.env`

3. Check logs:
   ```powershell
   docker compose logs mysql
   ```

### Frontend build fails

1. Clear cache:
   ```powershell
   rm -rf .next node_modules
   npm install
   ```

2. Check Node version:
   ```powershell
   node --version  # Should be 18+
   ```

### Database migration fails

1. Check Flyway history:
   ```powershell
   .\mvnw.cmd flyway:info
   ```

2. If needed, repair:
   ```powershell
   .\mvnw.cmd flyway:repair
   ```

3. For development, you can drop and recreate:
   ```powershell
   docker compose down -v
   docker compose up -d
   ```

### Port already in use

Backend (8080):
```powershell
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

Frontend (3000):
```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

---

## Code Quality

### Code Formatting

Backend (IntelliJ):
- Ctrl+Alt+L (format code)
- Use Google Java Style Guide

Frontend/Admin:
```powershell
npm run format  # If Prettier configured
```

### Static Analysis

Backend:
- SonarLint plugin in IDE
- SpotBugs for bug detection

Frontend:
- ESLint (already configured)

---

## Performance Testing

### Load Testing

Using Apache JMeter or k6:
```javascript
// k6 script example
import http from 'k6/http';

export default function() {
  http.get('http://localhost:8080/api/exams');
}
```

---

## Environment Variables

### Backend (application-dev.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Hot Reload

- **Backend:** Spring Boot DevTools (auto-restart on change)
- **Frontend:** Next.js fast refresh (instant updates)
- **Android:** Compose preview in Android Studio

---

## Useful Commands

### Docker

```powershell
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose down -v        # Stop and remove volumes
docker compose logs -f        # Follow logs
docker compose restart mysql  # Restart specific service
docker compose ps             # List services
```

### Maven

```powershell
.\mvnw.cmd clean              # Clean build artifacts
.\mvnw.cmd compile            # Compile
.\mvnw.cmd test               # Run tests
.\mvnw.cmd package            # Build JAR
.\mvnw.cmd spring-boot:run    # Run application
.\mvnw.cmd dependency:tree    # Show dependencies
```

### npm

```powershell
npm install                   # Install dependencies
npm run dev                   # Development server
npm run build                 # Production build
npm run start                 # Serve production
npm run lint                  # Lint code
npm test                      # Run tests
npm audit                     # Check vulnerabilities
npm audit fix                 # Fix vulnerabilities
```

### Gradle

```powershell
.\gradlew.bat tasks           # List tasks
.\gradlew.bat build           # Build project
.\gradlew.bat test            # Run tests
.\gradlew.bat clean           # Clean build
.\gradlew.bat assembleDebug   # Build debug APK
.\gradlew.bat assembleRelease # Build release APK
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21
