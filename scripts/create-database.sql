-- Create RapidStudy database and user
CREATE DATABASE IF NOT EXISTS rapidstudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (update password in production)
CREATE USER IF NOT EXISTS 'rapidstudy_user'@'localhost' IDENTIFIED BY 'password';
CREATE USER IF NOT EXISTS 'rapidstudy_user'@'%' IDENTIFIED BY 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON rapidstudy.* TO 'rapidstudy_user'@'localhost';
GRANT ALL PRIVILEGES ON rapidstudy.* TO 'rapidstudy_user'@'%';

FLUSH PRIVILEGES;

-- Verify
SELECT User, Host FROM mysql.user WHERE User = 'rapidstudy_user';
SHOW DATABASES LIKE 'rapidstudy';
