# RapidStudy — Complete API Reference (Phase 73)

## Base URL
- **Primary / Compatibility:** `http://localhost:8080/api`
- **Versioned:** `http://localhost:8080/api/v1`
- **Production:** `https://api.rapidstudy.in/api`

> All endpoints support both `/api/...` and `/api/v1/...` prefixes.

---

## Global Headers & Authentication
For protected routes, include the Bearer JWT token in the `Authorization` header:
```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

### Standard API Envelope
Every endpoint returns a unified response envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-15T11:00:00"
}
```

---

## 1. Authentication (`AUTH`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register student account | Public |
| `POST` | `/api/auth/login` | Login with email and password | Public |
| `POST` | `/api/auth/refresh` | Refresh access token using refresh token | Public |
| `POST` | `/api/auth/logout` | Client token revocation signal | Authenticated |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |

#### `POST /api/auth/register`
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "Password@123",
  "language": "EN"
}
```

#### `POST /api/auth/login`
```json
{
  "email": "ravi@example.com",
  "password": "Password@123"
}
```
**Response Data:**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "d8a7c2...",
  "tokenType": "Bearer",
  "userId": 1,
  "role": "STUDENT",
  "language": "EN"
}
```

---

## 2. Student Dashboard & Performance (`STUDENT`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/student/dashboard` | Student stats, streak, upcoming tests, recent activity | Student |
| `GET` | `/api/student/performance` | Detailed accuracy, score trends, and subject breakdown | Student |

---

## 3. Exams Taxonomy (`EXAMS`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/exams` | Paginated list of active exams (`?search=&page=0&size=12`) | Public |
| `GET` | `/api/exams/{id}` | Exam details with subjects and topics | Public |
| `GET` | `/api/exams/{id}/subjects`| List subjects belonging to an exam | Public |
| `GET` | `/api/exams/{id}/tests` | Published mock tests available for the exam | Public |

---

## 4. Question Bank (`QUESTIONS`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/questions` | List safe questions (`?topicId=&subjectId=&difficulty=&page=0&size=20`) | Authenticated |
| `GET` | `/api/questions/{id}` | Retrieve safe question by ID (no correct answers exposed) | Authenticated |

---

## 5. Mock Tests (`TESTS`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/tests` | List published mock tests (`?examId=&search=&page=0&size=12`)| Public |
| `GET` | `/api/tests/{id}` | Get test details and instructions | Public |
| `POST` | `/api/tests/{id}/attempts` | Initiate a new test attempt (starts server timer) | Student |

---

## 6. Test Attempts Engine (`ATTEMPTS`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/attempts/{id}` | Current attempt status, remaining time, and palette | Student (Owner) |
| `PUT` | `/api/attempts/{id}/answers/{questionId}` | Save or update selected option | Student (Owner) |
| `DELETE` | `/api/attempts/{id}/answers/{questionId}` | Clear saved option for question | Student (Owner) |
| `PUT` | `/api/attempts/{id}/questions/{questionId}/review` | Mark question for review | Student (Owner) |
| `POST` | `/api/attempts/{id}/submit` | Final submission and server-side score calculation | Student (Owner) |

#### `PUT /api/attempts/{id}/answers/{questionId}`
```json
{
  "selectedOptionId": 104,
  "timeSpentSeconds": 45
}
```

---

## 7. Results & Analysis (`RESULT`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/attempts/{id}/result` | Full scorecard, solution keys, and explanations | Student (Owner) |
| `GET` | `/api/attempts/{id}/analysis` | Subject/topic breakdown, accuracy, and timing insights | Student (Owner) |

---

## 8. Practice Mode (`PRACTICE`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/practice/questions` | Filtered practice questions (`?topicId=&difficulty=&page=0`) | Authenticated |

---

## 9. Bookmarks (`BOOKMARKS`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/bookmarks` | Get paginated bookmarked questions | Student |
| `POST` | `/api/bookmarks/{questionId}` | Add question to bookmarks | Student |
| `DELETE` | `/api/bookmarks/{questionId}`| Remove question from bookmarks | Student |

---

## 10. Leaderboard (`LEADERBOARD`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/leaderboard` | Top students ranking (`?period=DAILY|WEEKLY|MONTHLY|ALL_TIME`) | Authenticated |

---

## 11. Study Plans (`STUDY PLAN`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/study-plan` | Retrieve user study plans | Student |
| `POST` | `/api/study-plan` | Create a new study plan milestone | Student |
| `PUT` | `/api/study-plan/{id}` | Update existing study plan | Student |
| `DELETE` | `/api/study-plan/{id}` | Delete a study plan | Student |

---

## 12. Notifications (`NOTIFICATIONS`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications` | Get user notifications | Student |
| `PUT` | `/api/notifications/{id}/read` | Mark individual notification as read | Student |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Student |

---

## 13. Admin Management (`ADMIN`)

> All admin routes require `hasRole('ADMIN')`.

### User Administration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List platform users with filter/search |
| `PUT` | `/api/admin/users/{id}/status` | Activate or deactivate user account |
| `PUT` | `/api/admin/users/{id}/role` | Change user role (`STUDENT`, `ADMIN`) |

### Exam Administration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/exams` | List all exams (active & inactive) |
| `POST` | `/api/admin/exams` | Create a new exam |
| `PUT` | `/api/admin/exams/{id}` | Update exam details |
| `DELETE`| `/api/admin/exams/{id}` | Deactivate / soft-delete exam |

### Question Bank Administration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/questions` | List questions with full answers |
| `POST` | `/api/admin/questions` | Create a new question with options |
| `PUT` | `/api/admin/questions/{id}` | Update question and options |
| `DELETE`| `/api/admin/questions/{id}` | Deactivate question |
| `POST` | `/api/admin/questions/import` | Bulk import questions from XLSX/CSV file |

### Mock Test Administration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/tests` | List all tests (draft & published) |
| `POST` | `/api/admin/tests` | Create a new mock test |
| `PUT` | `/api/admin/tests/{id}` | Update test details (draft only) |
| `DELETE`| `/api/admin/tests/{id}` | Delete test (draft only) |
| `POST` | `/api/admin/tests/{id}/publish` | Publish test to students |
| `POST` | `/api/admin/tests/{id}/unpublish` | Unpublish test |

### Admin Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/analytics` | Platform metrics, attempt graphs, and registration counts |

---

## 14. AI Engine (`AI`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/ai/explain` | AI explanation for tricky questions | 10 req/min |
| `POST` | `/api/ai/generate-questions`| Generate draft questions (Admin) | 10 req/min |
| `POST` | `/api/ai/analyze-performance`| Personalized AI performance diagnosis | 10 req/min |
| `POST` | `/api/ai/generate-study-plan`| Customized preparation timeline generator | 10 req/min |
| `POST` | `/api/ai/personalized-test` | AI recommended practice test topics | 10 req/min |
