-- V9: Create test_attempts table
-- RapidStudy - User Test Attempts

CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    mock_test_id BIGINT NOT NULL,

    started_at DATETIME NOT NULL,
    submitted_at DATETIME NULL,
    expires_at DATETIME NOT NULL,

    score DECIMAL(8,2),
    total_marks DECIMAL(8,2),

    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers INT NOT NULL DEFAULT 0,
    unanswered INT NOT NULL DEFAULT 0,
    time_taken_seconds INT,

    status ENUM('IN_PROGRESS', 'SUBMITTED', 'EXPIRED')
        NOT NULL DEFAULT 'IN_PROGRESS',

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (mock_test_id)
        REFERENCES mock_tests(id)
        ON DELETE CASCADE,

    INDEX idx_test_attempts_user_id (user_id),
    INDEX idx_test_attempts_mock_test_id (mock_test_id),
    INDEX idx_test_attempts_status (status),
    INDEX idx_test_attempts_submitted_at (submitted_at)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;