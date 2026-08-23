-- V15: Update test_attempts.status ENUM to match application enums
-- Rename SUBMITTED -> COMPLETED, EXPIRED -> ABANDONED
-- Safe to run even if column already has correct values

ALTER TABLE test_attempts
    MODIFY COLUMN status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED')
        NOT NULL DEFAULT 'IN_PROGRESS';
