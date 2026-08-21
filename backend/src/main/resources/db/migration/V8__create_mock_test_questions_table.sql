-- V8: Create mock_test_questions table
-- RapidStudy - Mock Test Question Mapping

CREATE TABLE IF NOT EXISTS mock_test_questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mock_test_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    question_order INT NOT NULL,
    
    FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_mock_test_questions_test_id (mock_test_id),
    INDEX idx_mock_test_questions_question_id (question_id),
    UNIQUE KEY unique_test_question (mock_test_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
