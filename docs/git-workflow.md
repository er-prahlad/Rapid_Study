# Git Workflow & Branching Strategy — RapidStudy

## Overview
RapidStudy adheres to an adapted GitFlow branching model ensuring code stability, seamless parallel feature development, and traceable release histories.

---

## 1. Primary Branches

| Branch | Description | Access / Rules |
|--------|-------------|----------------|
| `main` | Production-ready, deployed to staging/production | Protected. Direct pushes prohibited. Merges only via reviewed PRs from `develop` or `hotfix/*`. |
| `develop` | Integration branch containing latest tested features | Default branch for active development. Features branch off and merge into here. |

---

## 2. Standard Feature Branches

All development happens in isolated feature branches branched from `develop`:

- `feature/auth` — User registration, login, JWT validation, token refresh, and password security
- `feature/exams` — Exam taxonomy, subjects, topics, and public listing APIs
- `feature/questions` — Question bank, MCQ options, CSV/XLSX bulk import, and student practice engine
- `feature/mock-tests` — Test creation, section configuration, timer engine, and question palette
- `feature/results` — Server-side scoring, attempt evaluation, accuracy calculations, and solution keys
- `feature/analytics` — Student performance charts, weak area detection, and Redis-backed leaderboards
- `feature/admin` — Admin CMS dashboard, user management, and mock test publishing controls
- `feature/android` — Native Android client, Jetpack Compose UI, MVVM architecture, and Retrofit client
- `feature/ai` — AI doubt solver, automated question generation, and personalized test recommendations
- `feature/docker` — Docker Compose configuration, multi-stage Dockerfiles, and Nginx reverse proxy

---

## 3. Branch Lifecycle & Commands

### Creating a new feature branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mock-tests
```

### Keeping branch up to date:
```bash
git checkout feature/mock-tests
git fetch origin
git rebase origin/develop
```

### Merging a feature into develop:
```bash
git checkout develop
git merge --no-ff feature/mock-tests
git push origin develop
```

---

## 4. Commit Message Convention (Conventional Commits)

Format:
```
<type>(<optional scope>): <description>

[optional body]
[optional footer]
```

### Commit Types:
- `feat:` — Introduces a new feature
- `fix:` — Patches a bug or issue
- `docs:` — Updates documentation only
- `style:` — Code styling, formatting, linting (no functional change)
- `refactor:` — Code restructuring without altering behavior
- `perf:` — Performance optimization
- `test:` — Adding or modifying automated tests
- `chore:` — Build scripts, package dependencies, CI/CD tweaks

### Standard Project Commit Examples:
- `feat: initialize spring boot backend`
- `feat: add mysql flyway migrations`
- `feat: implement jwt authentication`
- `feat: implement exam module`
- `feat: implement mock test engine`
- `feat: implement result analytics`
- `fix: prevent duplicate test submission`
- `feat: add redis-cached leaderboard service`
- `feat: configure nginx reverse proxy and docker-compose`
- `docs: update api reference and deployment runbooks`
- `test: add unit tests for server-side scoring algorithm`
