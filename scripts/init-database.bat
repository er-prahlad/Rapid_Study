@echo off
REM RapidStudy Database Initialization Script
REM Run this to create the database and user

echo ================================
echo  RapidStudy Database Setup
echo ================================
echo.

REM Check if mysql command exists
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL client not found in PATH
    echo.
    echo Please install MySQL client or use MySQL Workbench to run:
    echo   scripts/create-database.sql
    echo.
    pause
    exit /b 1
)

echo Creating database and user...
echo You may be prompted for MySQL root password.
echo.

mysql -u root -p < "%~dp0create-database.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Database created successfully!
    echo.
    echo Database: rapidstudy
    echo Username: rapidstudy_user
    echo Password: password
    echo.
    echo WARNING: Change the password in production!
) else (
    echo.
    echo [ERROR] Failed to create database
    echo.
    echo Manual Setup:
    echo 1. Open MySQL Workbench or command line
    echo 2. Run the SQL script: scripts/create-database.sql
)

echo.
pause
