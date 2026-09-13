-- Admin user create karo (agar V17 seed already run ho gaya ho)
-- Password: Admin@1234 (BCrypt hash)
-- PRODUCTION MEIN ZAROOR CHANGE KARO!

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

-- Verify karo
SELECT id, name, email, role, is_active FROM users WHERE role = 'ADMIN';
