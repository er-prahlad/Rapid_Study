-- V18: Create a new production admin account
-- Login:
-- Email: admin2@rapidstudy.in
-- Password: RapidStudy@Admin2026!

INSERT INTO users
    (name, email, phone, password_hash, role, language, is_active)
SELECT
    'Admin 2',
    'admin2@rapidstudy.in',
    '9000000001',
    '$2a$10$bB5sCUFQtbstS25Yiz/stOpefu9hUKihfnja6QoI6nJjOmKRmyVei',
    'ADMIN',
    'EN',
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'admin2@rapidstudy.in'
);