# RapidStudy - API Documentation

## Base URL

**Development:** `http://localhost:8080/api`  
**Production:** `https://api.rapidstudy.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-08-21T10:30:00Z",
  "path": "/api/endpoint"
}
```

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "language": "EN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "language": "EN"
    }
  }
}
```

#### Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as Register

#### Refresh Token
```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

---

### Student Dashboard

#### Get Dashboard Data
```
GET /api/student/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyTarget": {
      "questionsTarget": 50,
      "questionsCompleted": 32,
      "testsTarget": 1,
      "testsCompleted": 0
    },
    "currentStreak": 7,
    "performance": {
      "averageScore": 75.5,
      "accuracy": 82.3,
      "testsAttempted": 15,
      "bestScore": 95.0
    },
    "upcomingTests": [...],
    "recentPerformance": [...],
    "popularExams": [...]
  }
}
```

---

### Exams

#### List All Exams
```
GET /api/exams?page=0&size=10&search=ssc
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "SSC CGL",
        "code": "SSC_CGL",
        "description": "Combined Graduate Level Exam",
        "logo": "url_to_logo",
        "isActive": true
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

#### Get Exam Details
```
GET /api/exams/{id}
```

#### Get Exam Subjects
```
GET /api/exams/{id}/subjects
```

#### Get Exam Tests
```
GET /api/exams/{id}/tests?page=0&size=10
```

---

### Questions

#### Get Questions
```
GET /api/questions?topicId=5&difficulty=MEDIUM&page=0&size=20
```

**Query Parameters:**
- `topicId` (optional)
- `difficulty` (optional): EASY, MEDIUM, HARD
- `page`, `size`

#### Get Question By ID
```
GET /api/questions/{id}
```

---

### Mock Tests

#### List Tests
```
GET /api/tests?examId=1&page=0&size=10
```

#### Get Test Details
```
GET /api/tests/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "SSC CGL Mock Test 1",
    "description": "Full length mock test",
    "durationMinutes": 120,
    "totalQuestions": 100,
    "totalMarks": 200,
    "negativeMarks": 0.5,
    "isPublished": true,
    "exam": {
      "id": 1,
      "name": "SSC CGL"
    }
  }
}
```

#### Start Test Attempt
```
POST /api/tests/{testId}/attempts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": 123,
    "startedAt": "2026-08-21T10:00:00Z",
    "expiresAt": "2026-08-21T12:00:00Z",
    "questions": [
      {
        "id": 1,
        "questionText": "What is 2+2?",
        "questionTextHindi": "2+2 क्या है?",
        "questionType": "MCQ",
        "marks": 2,
        "negativeMarks": 0.5,
        "options": [
          {
            "id": 1,
            "optionText": "3",
            "optionTextHindi": "3",
            "optionOrder": 1
          },
          {
            "id": 2,
            "optionText": "4",
            "optionTextHindi": "4",
            "optionOrder": 2
          }
        ]
      }
    ]
  }
}
```

---

### Test Attempts

#### Get Attempt Details
```
GET /api/attempts/{attemptId}
Authorization: Bearer <token>
```

#### Save Answer
```
PUT /api/attempts/{attemptId}/answers/{questionId}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "selectedOptionId": 2
}
```

#### Clear Answer
```
DELETE /api/attempts/{attemptId}/answers/{questionId}
Authorization: Bearer <token>
```

#### Mark for Review
```
PUT /api/attempts/{attemptId}/questions/{questionId}/review
Authorization: Bearer <token>
```

**Request:**
```json
{
  "markedForReview": true
}
```

#### Submit Test
```
POST /api/attempts/{attemptId}/submit
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": 123,
    "score": 150.5,
    "totalMarks": 200,
    "percentage": 75.25,
    "correct": 80,
    "wrong": 15,
    "unanswered": 5,
    "timeTaken": 7200,
    "rank": 45
  }
}
```

---

### Results & Analytics

#### Get Result
```
GET /api/attempts/{attemptId}/result
Authorization: Bearer <token>
```

#### Get Detailed Analysis
```
GET /api/attempts/{attemptId}/analysis
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "score": 150.5,
      "accuracy": 84.2,
      "timeTaken": 7200
    },
    "subjectWise": [
      {
        "subjectName": "Quantitative Aptitude",
        "correct": 20,
        "wrong": 3,
        "unanswered": 2,
        "accuracy": 87.0,
        "avgTime": 65
      }
    ],
    "difficultyWise": [...],
    "scoreHistory": [...]
  }
}
```

---

### Practice

#### Get Practice Questions
```
GET /api/practice/questions?mode=RANDOM&topicId=5&difficulty=MEDIUM
Authorization: Bearer <token>
```

**Query Parameters:**
- `mode`: RANDOM, SUBJECT, TOPIC, WEAK_AREA
- `topicId`, `subjectId`, `difficulty`

---

### Bookmarks

#### Get Bookmarks
```
GET /api/bookmarks?page=0&size=20
Authorization: Bearer <token>
```

#### Add Bookmark
```
POST /api/bookmarks/{questionId}
Authorization: Bearer <token>
```

#### Remove Bookmark
```
DELETE /api/bookmarks/{questionId}
Authorization: Bearer <token>
```

---

### Leaderboard

#### Get Leaderboard
```
GET /api/leaderboard?period=WEEKLY&testId=1
```

**Query Parameters:**
- `period`: DAILY, WEEKLY, MONTHLY, ALL_TIME
- `testId` (optional): Specific test leaderboard

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "name": "John Doe",
      "profileImage": "url",
      "score": 95.5,
      "tests": 25,
      "accuracy": 89.2
    }
  ]
}
```

---

### Study Plan

#### Get Study Plan
```
GET /api/study-plan
Authorization: Bearer <token>
```

#### Create Study Plan
```
POST /api/study-plan
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "SSC CGL Preparation",
  "startDate": "2026-09-01",
  "endDate": "2026-12-31",
  "targetTests": 50,
  "targetQuestions": 5000
}
```

#### Update Study Plan
```
PUT /api/study-plan/{id}
Authorization: Bearer <token>
```

#### Delete Study Plan
```
DELETE /api/study-plan/{id}
Authorization: Bearer <token>
```

---

### Notifications

#### Get Notifications
```
GET /api/notifications?page=0&size=20
Authorization: Bearer <token>
```

#### Mark as Read
```
PUT /api/notifications/{id}/read
Authorization: Bearer <token>
```

#### Mark All as Read
```
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

---

### Admin Endpoints

All admin endpoints require `ADMIN` role.

#### User Management
```
GET    /api/admin/users
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}/status
PUT    /api/admin/users/{id}/role
```

#### Exam Management
```
GET    /api/admin/exams
POST   /api/admin/exams
PUT    /api/admin/exams/{id}
DELETE /api/admin/exams/{id}
```

#### Question Management
```
GET    /api/admin/questions
POST   /api/admin/questions
PUT    /api/admin/questions/{id}
DELETE /api/admin/questions/{id}
POST   /api/admin/questions/import
```

#### Test Management
```
GET    /api/admin/tests
POST   /api/admin/tests
PUT    /api/admin/tests/{id}
DELETE /api/admin/tests/{id}
POST   /api/admin/tests/{id}/publish
POST   /api/admin/tests/{id}/unpublish
```

#### Analytics
```
GET /api/admin/analytics/dashboard
```

---

### AI Endpoints

#### Explain Question
```
POST /api/ai/explain
Authorization: Bearer <token>
```

**Request:**
```json
{
  "questionId": 123
}
```

#### Generate Questions
```
POST /api/admin/ai/generate-questions
Authorization: Bearer <token> (Admin only)
```

**Request:**
```json
{
  "topicId": 5,
  "difficulty": "MEDIUM",
  "count": 10,
  "language": "EN"
}
```

#### Analyze Performance
```
POST /api/ai/analyze-performance
Authorization: Bearer <token>
```

---

## Rate Limiting

- **Public endpoints:** 100 requests per minute
- **Authenticated endpoints:** 200 requests per minute
- **AI endpoints:** 10 requests per minute

## Pagination

All list endpoints support pagination:
- `page`: Page number (0-indexed)
- `size`: Items per page (max: 100)
- `sort`: Sort field (e.g., `createdAt,desc`)

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:8080/swagger-ui.html
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21
