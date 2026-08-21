-- V5: Create questions table
-- RapidStudy - Question Bank

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    topic_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_text_hindi TEXT,
    question_type ENUM('MCQ', 'MULTI_SELECT', 'NUMERIC') NOT NULL DEFAULT 'MCQ',
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    explanation TEXT,
    explanation_hindi TEXT,
    marks DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    negative_marks DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_questions_topic_id (topic_id),
    INDEX idx_questions_difficulty (difficulty),
    INDEX idx_questions_is_active (is_active),
    INDEX idx_questions_question_type (question_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
