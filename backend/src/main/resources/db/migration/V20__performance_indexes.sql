-- V20: Performance indexes — Phase 67
-- Frequently used query patterns ke liye composite indexes

-- Test attempts: user + date range queries
ALTER TABLE test_attempts
    ADD INDEX idx_attempts_user_submitted (user_id, submitted_at),
    ADD INDEX idx_attempts_submitted_status (submitted_at, status);

-- Questions: topic + difficulty + active (practice filtering)
ALTER TABLE questions
    ADD INDEX idx_questions_topic_diff_active (topic_id, difficulty, is_active);

-- Bookmarks: user lookup (already has user_id index, add composite)
ALTER TABLE bookmarks
    ADD INDEX idx_bookmarks_user_created (user_id, created_at DESC);

-- Mock test questions: test ordering (already indexed, verify)
ALTER TABLE mock_test_questions
    ADD INDEX idx_mtq_test_order (mock_test_id, question_order);

-- Notifications: user + unread (most common query)
ALTER TABLE notifications
    ADD INDEX idx_notif_user_unread (user_id, is_read, created_at DESC);
