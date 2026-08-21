-- V11: Create bookmarks table
-- RapidStudy - User Bookmarked Questions

CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_bookmarks_user_id (user_id),
    INDEX idx_bookmarks_question_id (question_id),
    INDEX idx_bookmarks_created_at (created_at),
    UNIQUE KEY unique_user_question (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
