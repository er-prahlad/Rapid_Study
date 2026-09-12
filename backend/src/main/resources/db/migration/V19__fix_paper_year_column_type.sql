-- V19: Fix paper_year column type from SMALLINT to INT
-- Caused by mismatch between V16 migration (SMALLINT) and MockTest entity (Integer → INT)
ALTER TABLE mock_tests
    MODIFY COLUMN paper_year INT NULL COMMENT 'e.g. 2023, NULL for mock tests';
