# RapidStudy - Database Documentation

## Database Design

### Overview
RapidStudy uses MySQL 8 as the primary relational database with Flyway for version-controlled migrations.

## Schema Management

### Flyway Migrations
- Location: `backend/src/main/resources/db/migration/`
- Naming: `V{version}__{description}.sql`
- Example: `V1__create_users.sql`

**Rules:**
- Never modify applied migrations
- Always create new migration for schema changes
- Use descriptive names
- Test migrations before committing

## Entity Relationship Diagram

```
┌──────────┐
│   User   │──────┐
└────┬─────┘      │
     │            │
     │ 1          │ 1
     │            │
     │ *          │ *
┌────▼──────────┐ │     ┌──────────────┐
│ TestAttempt   │ │     │  Bookmark    │
└────┬──────────┘ │     └──────────────┘
     │            │
     │ 1          │ *
     │            │ ┌────────────────┐
     │ *          └─│ StudyPlan      │
┌────▼───────────┐  └────────────────┘
│ AttemptAnswer  │
└────┬───────────┘
     │
     │ * 
     │
┌────▼─────┐      ┌──────────┐
│ Question │──────│  Exam    │
└────┬─────┘  *   └────┬─────┘
     │ *            1  │
     │                 │ *
┌────▼────┐      ┌─────▼────┐
│ Option  │      │ Subject  │
└─────────┘      └────┬─────┘
                      │ *
                 ┌────▼────┐
                 │  Topic  │
                 └─────────┘
```

## Core Tables

### users
Stores user account information.

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500),
  role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
  language ENUM('EN', 'HI', 'HIEN') DEFAULT 'EN',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);
```

### exams
Stores exam categories (SSC, UPSC, etc.).

```sql
CREATE TABLE exams (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  logo VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_is_active (is_active)
);
```

### subjects
Exam subjects (Quantitative Aptitude, Reasoning, etc.).

```sql
CREATE TABLE subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id),
  INDEX idx_display_order (display_order)
);
```

### topics
Subject topics for granular organization.

```sql
CREATE TABLE topics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_subject_id (subject_id),
  INDEX idx_display_order (display_order)
);
```

### questions
The question bank.

```sql
CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  topic_id BIGINT NOT NULL,
  question_text TEXT NOT NULL,
  question_text_hindi TEXT,
  question_type ENUM('MCQ', 'MULTI_SELECT', 'NUMERIC') DEFAULT 'MCQ',
  difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
  explanation TEXT,
  explanation_hindi TEXT,
  marks DECIMAL(5,2) DEFAULT 1.0,
  negative_marks DECIMAL(5,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  INDEX idx_topic_id (topic_id),
  INDEX idx_difficulty (difficulty),
  INDEX idx_is_active (is_active)
);
```

### options
Answer options for questions.

```sql
CREATE TABLE options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_text TEXT NOT NULL,
  option_text_hindi TEXT,
  option_order INT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  UNIQUE KEY unique_question_order (question_id, option_order)
);
```

### mock_tests
Mock test configurations.

```sql
CREATE TABLE mock_tests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  total_marks DECIMAL(8,2) NOT NULL,
  negative_marks DECIMAL(5,2) DEFAULT 0.0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id),
  INDEX idx_is_published (is_published)
);
```

### mock_test_questions
Maps questions to mock tests.

```sql
CREATE TABLE mock_test_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mock_test_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  question_order INT NOT NULL,
  
  FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_mock_test_id (mock_test_id),
  INDEX idx_question_id (question_id),
  UNIQUE KEY unique_test_question (mock_test_id, question_id)
);
```

### test_attempts
User test attempt records.

```sql
CREATE TABLE test_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  mock_test_id BIGINT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  score DECIMAL(8,2),
  total_marks DECIMAL(8,2),
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  unanswered INT DEFAULT 0,
  time_taken_seconds INT,
  status ENUM('IN_PROGRESS', 'SUBMITTED', 'EXPIRED') DEFAULT 'IN_PROGRESS',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_mock_test_id (mock_test_id),
  INDEX idx_status (status)
);
```

### attempt_answers
Individual answers within an attempt.

```sql
CREATE TABLE attempt_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  selected_option_id BIGINT,
  is_correct BOOLEAN,
  marks_obtained DECIMAL(5,2),
  marked_for_review BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMP,
  
  FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_option_id) REFERENCES options(id) ON DELETE SET NULL,
  INDEX idx_attempt_id (attempt_id),
  INDEX idx_question_id (question_id),
  UNIQUE KEY unique_attempt_question (attempt_id, question_id)
);
```

### bookmarks
User bookmarked questions.

```sql
CREATE TABLE bookmarks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_question_id (question_id),
  UNIQUE KEY unique_user_question (user_id, question_id)
);
```

### user_question_progress
Tracks user progress on individual questions.

```sql
CREATE TABLE user_question_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  last_attempted_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_question_id (question_id),
  UNIQUE KEY unique_user_question (user_id, question_id)
);
```

### study_plans
User study plan configurations.

```sql
CREATE TABLE study_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_tests INT DEFAULT 0,
  target_questions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active)
);
```

### notifications
User notifications.

```sql
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('SYSTEM', 'TEST', 'STUDY', 'LEADERBOARD', 'REMINDER') DEFAULT 'SYSTEM',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type)
);
```

## Important Indexes

### Performance-Critical Indexes
- `users.email` - Login queries
- `test_attempts.user_id` - User performance queries
- `attempt_answers.attempt_id` - Answer retrieval
- `questions.topic_id` - Question filtering
- `mock_tests.exam_id` - Test listing

## Data Integrity

### Foreign Key Constraints
All relationships have foreign key constraints with appropriate CASCADE or SET NULL actions.

### Unique Constraints
- `users.email` - Prevent duplicate accounts
- `exams.code` - Prevent duplicate exam codes
- `mock_test_questions` - Prevent duplicate questions in a test
- `attempt_answers` - One answer per question per attempt
- `bookmarks` - One bookmark per question per user

## Backup Strategy

### Development
- Docker volume for persistence
- Regular exports for safety

### Production
- Daily automated backups
- Point-in-time recovery enabled
- Off-site backup storage
- Regular restore testing

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21
