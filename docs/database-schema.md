# RapidStudy - Database Schema

## Overview

The RapidStudy database consists of 14 core tables organized into logical groups for user management, content organization, test execution, and user progress tracking.

---

## Database: `rapidstudy`

**Character Set:** `utf8mb4`  
**Collation:** `utf8mb4_unicode_ci`  
**Engine:** InnoDB

---

## Migration Files

All tables are created via Flyway migrations in proper dependency order:

1. `V1__create_users_table.sql` - User accounts
2. `V2__create_exams_table.sql` - Exam categories
3. `V3__create_subjects_table.sql` - Exam subjects
4. `V4__create_topics_table.sql` - Subject topics
5. `V5__create_questions_table.sql` - Question bank
6. `V6__create_options_table.sql` - Question options
7. `V7__create_mock_tests_table.sql` - Mock test configuration
8. `V8__create_mock_test_questions_table.sql` - Test-question mapping
9. `V9__create_test_attempts_table.sql` - User test attempts
10. `V10__create_attempt_answers_table.sql` - Individual answers
11. `V11__create_bookmarks_table.sql` - Bookmarked questions
12. `V12__create_user_question_progress_table.sql` - Question-level progress
13. `V13__create_study_plans_table.sql` - Study plan management
14. `V14__create_notifications_table.sql` - User notifications

---

## Table Groups

### 1. User Management
- **users** - User accounts and profiles

### 2. Content Hierarchy
- **exams** - Exam categories (SSC, UPSC, etc.)
- **subjects** - Exam subjects (Math, Reasoning, etc.)
- **topics** - Subject topics (Algebra, Geometry, etc.)
- **questions** - Question bank
- **options** - Answer options for questions

### 3. Test Management
- **mock_tests** - Mock test configurations
- **mock_test_questions** - Questions included in each test

### 4. Test Execution
- **test_attempts** - User test attempts
- **attempt_answers** - Individual question answers

### 5. User Progress
- **bookmarks** - Saved questions
- **user_question_progress** - Practice statistics per question
- **study_plans** - Personalized study schedules
- **notifications** - System and user notifications

---

## Detailed Schema

### users
Core user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | User ID |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| phone | VARCHAR(20) | NULL | Phone number |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| profile_image | VARCHAR(500) | NULL | Profile image URL |
| role | ENUM | NOT NULL, DEFAULT 'STUDENT' | STUDENT, ADMIN |
| language | ENUM | NOT NULL, DEFAULT 'EN' | EN, HI, HIEN |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Indexes:** email, role, is_active, created_at

---

### exams
Exam categories (SSC CGL, UPSC, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Exam ID |
| name | VARCHAR(100) | NOT NULL | Exam name |
| code | VARCHAR(50) | NOT NULL, UNIQUE | Unique code (SSC_CGL) |
| description | TEXT | NULL | Exam description |
| logo | VARCHAR(500) | NULL | Logo URL |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Indexes:** code, is_active

---

### subjects
Subjects within each exam.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Subject ID |
| exam_id | BIGINT | FK → exams.id, NOT NULL | Parent exam |
| name | VARCHAR(100) | NOT NULL | Subject name |
| description | TEXT | NULL | Description |
| display_order | INT | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Foreign Keys:** exam_id → exams(id) ON DELETE CASCADE  
**Indexes:** exam_id, display_order

---

### topics
Topics within each subject.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Topic ID |
| subject_id | BIGINT | FK → subjects.id, NOT NULL | Parent subject |
| name | VARCHAR(100) | NOT NULL | Topic name |
| description | TEXT | NULL | Description |
| display_order | INT | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Foreign Keys:** subject_id → subjects(id) ON DELETE CASCADE  
**Indexes:** subject_id, display_order

---

### questions
Question bank with bilingual support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Question ID |
| topic_id | BIGINT | FK → topics.id, NOT NULL | Parent topic |
| question_text | TEXT | NOT NULL | Question (English) |
| question_text_hindi | TEXT | NULL | Question (Hindi) |
| question_type | ENUM | NOT NULL, DEFAULT 'MCQ' | MCQ, MULTI_SELECT, NUMERIC |
| difficulty | ENUM | NOT NULL, DEFAULT 'MEDIUM' | EASY, MEDIUM, HARD |
| explanation | TEXT | NULL | Explanation (English) |
| explanation_hindi | TEXT | NULL | Explanation (Hindi) |
| marks | DECIMAL(5,2) | NOT NULL, DEFAULT 1.0 | Positive marks |
| negative_marks | DECIMAL(5,2) | NOT NULL, DEFAULT 0.0 | Negative marks |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Foreign Keys:** topic_id → topics(id) ON DELETE CASCADE  
**Indexes:** topic_id, difficulty, is_active, question_type

---

### options
Answer options for questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Option ID |
| question_id | BIGINT | FK → questions.id, NOT NULL | Parent question |
| option_text | TEXT | NOT NULL | Option text (English) |
| option_text_hindi | TEXT | NULL | Option text (Hindi) |
| option_order | INT | NOT NULL | Display order (1-4) |
| is_correct | BOOLEAN | NOT NULL, DEFAULT FALSE | Correct answer flag |

**Foreign Keys:** question_id → questions(id) ON DELETE CASCADE  
**Indexes:** question_id  
**Unique:** (question_id, option_order)

---

### mock_tests
Mock test configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Test ID |
| exam_id | BIGINT | FK → exams.id, NOT NULL | Parent exam |
| title | VARCHAR(200) | NOT NULL | Test title |
| description | TEXT | NULL | Description |
| duration_minutes | INT | NOT NULL | Test duration |
| total_questions | INT | NOT NULL | Question count |
| total_marks | DECIMAL(8,2) | NOT NULL | Maximum marks |
| negative_marks | DECIMAL(5,2) | NOT NULL, DEFAULT 0.0 | Negative marking |
| is_published | BOOLEAN | NOT NULL, DEFAULT FALSE | Published status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Foreign Keys:** exam_id → exams(id) ON DELETE CASCADE  
**Indexes:** exam_id, is_published

---

### mock_test_questions
Maps questions to mock tests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Mapping ID |
| mock_test_id | BIGINT | FK → mock_tests.id, NOT NULL | Test |
| question_id | BIGINT | FK → questions.id, NOT NULL | Question |
| question_order | INT | NOT NULL | Display order |

**Foreign Keys:**  
- mock_test_id → mock_tests(id) ON DELETE CASCADE  
- question_id → questions(id) ON DELETE CASCADE

**Indexes:** mock_test_id, question_id  
**Unique:** (mock_test_id, question_id)

---

### test_attempts
User test attempt records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Attempt ID |
| user_id | BIGINT | FK → users.id, NOT NULL | User |
| mock_test_id | BIGINT | FK → mock_tests.id, NOT NULL | Test |
| started_at | TIMESTAMP | NOT NULL | Start time |
| submitted_at | TIMESTAMP | NULL | Submission time |
| expires_at | TIMESTAMP | NOT NULL | Expiration time (server-controlled) |
| score | DECIMAL(8,2) | NULL | Final score |
| total_marks | DECIMAL(8,2) | NULL | Maximum possible |
| correct_answers | INT | NOT NULL, DEFAULT 0 | Correct count |
| wrong_answers | INT | NOT NULL, DEFAULT 0 | Wrong count |
| unanswered | INT | NOT NULL, DEFAULT 0 | Unanswered count |
| time_taken_seconds | INT | NULL | Time taken |
| status | ENUM | NOT NULL, DEFAULT 'IN_PROGRESS' | IN_PROGRESS, SUBMITTED, EXPIRED |

**Foreign Keys:**  
- user_id → users(id) ON DELETE CASCADE  
- mock_test_id → mock_tests(id) ON DELETE CASCADE

**Indexes:** user_id, mock_test_id, status, submitted_at

---

### attempt_answers
Individual answers within an attempt.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Answer ID |
| attempt_id | BIGINT | FK → test_attempts.id, NOT NULL | Attempt |
| question_id | BIGINT | FK → questions.id, NOT NULL | Question |
| selected_option_id | BIGINT | FK → options.id, NULL | Selected option |
| is_correct | BOOLEAN | NULL | Correctness (set after submission) |
| marks_obtained | DECIMAL(5,2) | NULL | Marks (positive/negative/zero) |
| marked_for_review | BOOLEAN | NOT NULL, DEFAULT FALSE | Review flag |
| answered_at | TIMESTAMP | NULL | Answer time |

**Foreign Keys:**  
- attempt_id → test_attempts(id) ON DELETE CASCADE  
- question_id → questions(id) ON DELETE CASCADE  
- selected_option_id → options(id) ON DELETE SET NULL

**Indexes:** attempt_id, question_id, marked_for_review  
**Unique:** (attempt_id, question_id)

---

### bookmarks
User bookmarked questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Bookmark ID |
| user_id | BIGINT | FK → users.id, NOT NULL | User |
| question_id | BIGINT | FK → questions.id, NOT NULL | Question |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |

**Foreign Keys:**  
- user_id → users(id) ON DELETE CASCADE  
- question_id → questions(id) ON DELETE CASCADE

**Indexes:** user_id, question_id, created_at  
**Unique:** (user_id, question_id)

---

### user_question_progress
Tracks practice statistics per question per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Progress ID |
| user_id | BIGINT | FK → users.id, NOT NULL | User |
| question_id | BIGINT | FK → questions.id, NOT NULL | Question |
| attempts | INT | NOT NULL, DEFAULT 0 | Attempt count |
| correct_count | INT | NOT NULL, DEFAULT 0 | Correct attempts |
| wrong_count | INT | NOT NULL, DEFAULT 0 | Wrong attempts |
| last_attempted_at | TIMESTAMP | NULL | Last attempt time |

**Foreign Keys:**  
- user_id → users(id) ON DELETE CASCADE  
- question_id → questions(id) ON DELETE CASCADE

**Indexes:** user_id, question_id, last_attempted_at  
**Unique:** (user_id, question_id)

---

### study_plans
User study plan configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Plan ID |
| user_id | BIGINT | FK → users.id, NOT NULL | User |
| title | VARCHAR(200) | NOT NULL | Plan title |
| start_date | DATE | NOT NULL | Start date |
| end_date | DATE | NOT NULL | End date |
| target_tests | INT | NOT NULL, DEFAULT 0 | Test target |
| target_questions | INT | NOT NULL, DEFAULT 0 | Question target |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, ON UPDATE | Last update time |

**Foreign Keys:** user_id → users(id) ON DELETE CASCADE  
**Indexes:** user_id, is_active, start_date, end_date

---

### notifications
System and user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Notification ID |
| user_id | BIGINT | FK → users.id, NOT NULL | User |
| title | VARCHAR(200) | NOT NULL | Title |
| message | TEXT | NOT NULL | Message content |
| type | ENUM | NOT NULL, DEFAULT 'SYSTEM' | SYSTEM, TEST, STUDY, LEADERBOARD, REMINDER |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |

**Foreign Keys:** user_id → users(id) ON DELETE CASCADE  
**Indexes:** user_id, is_read, type, created_at

---

## Relationship Diagram

```
users
  ├─→ test_attempts
  │     └─→ attempt_answers
  ├─→ bookmarks
  ├─→ user_question_progress
  ├─→ study_plans
  └─→ notifications

exams
  ├─→ subjects
  │     └─→ topics
  │           └─→ questions
  │                 └─→ options
  └─→ mock_tests
        └─→ mock_test_questions
```

---

## Key Design Principles

1. **Referential Integrity:** All foreign keys with proper ON DELETE actions
2. **Bilingual Support:** Hindi and English text fields for questions and options
3. **Soft Deletes:** `is_active` flags where needed
4. **Audit Trail:** `created_at` and `updated_at` timestamps
5. **Performance:** Strategic indexes on frequently queried columns
6. **Data Integrity:** Unique constraints prevent duplicates
7. **Scalability:** BIGINT IDs and proper index usage

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21  
**Phase:** 2 - Database Schema Creation
