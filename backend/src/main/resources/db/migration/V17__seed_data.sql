-- V17: Seed initial data for development
-- Creates 6 exams, subjects, topics, and 1 admin account
-- Admin password hash = BCrypt("Admin@1234") — CHANGE IN PRODUCTION

-- ── Admin user ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO users (name, email, phone, password_hash, role, language, is_active)
VALUES (
    'Admin',
    'admin@rapidstudy.in',
    '9000000000',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTpyGBTDq7i',
    'ADMIN',
    'EN',
    1
);

-- ── Exams ──────────────────────────────────────────────────────────────────
INSERT IGNORE INTO exams (name, code, description, is_active) VALUES
('SSC CGL',   'SSC_CGL',  'Combined Graduate Level Examination by Staff Selection Commission', 1),
('SSC CHSL',  'SSC_CHSL', 'Combined Higher Secondary Level Examination by SSC', 1),
('UPSC CSE',  'UPSC_CSE', 'Civil Services Examination by Union Public Service Commission', 1),
('BPSC',      'BPSC',     'Bihar Public Service Commission examination', 1),
('Railway',   'RAILWAY',  'Railway Recruitment Board examinations (NTPC, Group D)', 1),
('Bank PO',   'BANK_PO',  'Probationary Officer examination for public sector banks', 1);

-- ── Subjects for SSC CGL ───────────────────────────────────────────────────
INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'Quantitative Aptitude', 'Mathematics and numerical ability', 1 FROM exams e WHERE e.code='SSC_CGL';

INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'Reasoning', 'Logical and analytical reasoning', 2 FROM exams e WHERE e.code='SSC_CGL';

INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'English Language', 'Grammar, vocabulary and comprehension', 3 FROM exams e WHERE e.code='SSC_CGL';

INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'General Awareness', 'Current affairs, history, geography and science', 4 FROM exams e WHERE e.code='SSC_CGL';

-- ── Subjects for UPSC CSE ─────────────────────────────────────────────────
INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'History', 'Ancient, Medieval and Modern Indian History', 1 FROM exams e WHERE e.code='UPSC_CSE';

INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'Geography', 'Physical, Human and Economic Geography', 2 FROM exams e WHERE e.code='UPSC_CSE';

INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'Polity', 'Indian Constitution and Political System', 3 FROM exams e WHERE e.code='UPSC_CSE';

INSERT IGNORE INTO subjects (exam_id, name, description, display_order)
SELECT e.id, 'Economy', 'Indian and World Economy', 4 FROM exams e WHERE e.code='UPSC_CSE';

-- ── Topics for Quantitative Aptitude ──────────────────────────────────────
INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Number System', 1 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Quantitative Aptitude';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Percentage', 2 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Quantitative Aptitude';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Profit and Loss', 3 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Quantitative Aptitude';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Simple & Compound Interest', 4 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Quantitative Aptitude';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Time & Work', 5 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Quantitative Aptitude';

-- ── Topics for Reasoning ──────────────────────────────────────────────────
INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Analogy', 1 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Reasoning';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Series', 2 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Reasoning';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Coding-Decoding', 3 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Reasoning';

INSERT IGNORE INTO topics (subject_id, name, display_order)
SELECT s.id, 'Blood Relations', 4 FROM subjects s
JOIN exams e ON s.exam_id = e.id WHERE e.code='SSC_CGL' AND s.name='Reasoning';
