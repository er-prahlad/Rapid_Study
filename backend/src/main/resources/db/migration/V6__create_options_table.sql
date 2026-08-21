-- V6: Create options table
-- RapidStudy - Question Options

CREATE TABLE IF NOT EXISTS options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    option_text_hindi TEXT,
    option_order INT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_options_question_id (question_id),
    UNIQUE KEY unique_question_option_order (question_id, option_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
