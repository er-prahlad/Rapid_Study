-- V4: Create topics table
-- RapidStudy - Topic Management

CREATE TABLE IF NOT EXISTS topics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_topics_subject_id (subject_id),
    INDEX idx_topics_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
