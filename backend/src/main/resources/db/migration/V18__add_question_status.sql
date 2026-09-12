-- V18: Add status field to questions for AI-generated question workflow
-- DRAFT = needs admin review, APPROVED = reviewed, PUBLISHED = live
ALTER TABLE questions
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED'
        COMMENT 'DRAFT | APPROVED | PUBLISHED',
    ADD COLUMN ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD INDEX idx_questions_status (status);

-- Existing questions default to PUBLISHED
UPDATE questions SET status = 'PUBLISHED' WHERE status = 'PUBLISHED';
