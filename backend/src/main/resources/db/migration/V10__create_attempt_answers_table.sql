-- V10: Create attempt_answers table
-- RapidStudy - Individual Attempt Answers

CREATE TABLE IF NOT EXISTS attempt_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT,
    is_correct BOOLEAN,
    marks_obtained DECIMAL(5,2),
    marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at TIMESTAMP,
    
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES options(id) ON DELETE SET NULL,
    INDEX idx_attempt_answers_attempt_id (attempt_id),
    INDEX idx_attempt_answers_question_id (question_id),
    INDEX idx_attempt_answers_marked_for_review (marked_for_review),
    UNIQUE KEY unique_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
