-- V22: Add live / scheduled test support columns to mock_tests table
-- Fixes SchemaManagementException on startup: missing column [live_ends_at] in table [mock_tests]

ALTER TABLE mock_tests
    ADD COLUMN live_starts_at DATETIME NULL COMMENT 'Live / Scheduled test start time (null for regular anytime tests)',
    ADD COLUMN live_ends_at   DATETIME NULL COMMENT 'Live / Scheduled test end time',
    ADD INDEX  idx_mock_tests_live_starts_at (live_starts_at),
    ADD INDEX  idx_mock_tests_live_ends_at (live_ends_at);
