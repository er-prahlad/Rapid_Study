-- V16: Add previous year paper support to mock_tests
ALTER TABLE mock_tests
    ADD COLUMN paper_year  SMALLINT     NULL         COMMENT 'e.g. 2023, NULL for mock tests',
    ADD COLUMN paper_type  VARCHAR(20)  NOT NULL DEFAULT 'MOCK_TEST' COMMENT 'MOCK_TEST or PREVIOUS_YEAR',
    ADD INDEX  idx_mock_tests_paper_type (paper_type),
    ADD INDEX  idx_mock_tests_paper_year (paper_year);
