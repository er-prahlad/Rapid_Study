-- V7: Create mock_tests table
-- RapidStudy - Mock Test Configuration

CREATE TABLE IF NOT EXISTS mock_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    total_questions INT NOT NULL,
    total_marks DECIMAL(8,2) NOT NULL,
    negative_marks DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_mock_tests_exam_id (exam_id),
    INDEX idx_mock_tests_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
