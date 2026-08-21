-- V12: Create user_question_progress table
-- RapidStudy - Track User Progress on Questions

CREATE TABLE IF NOT EXISTS user_question_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    last_attempted_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_user_question_progress_user_id (user_id),
    INDEX idx_user_question_progress_question_id (question_id),
    INDEX idx_user_question_progress_last_attempted (last_attempted_at),
    UNIQUE KEY unique_user_question_progress (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
