# RapidStudy - Database Setup Script
# Run this to create the database and user

Write-Host "================================" -ForegroundColor Cyan
Write-Host " RapidStudy Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
$mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
if (!$mysqlProcess) {
    Write-Host "❌ MySQL is not running!" -ForegroundColor Red
    Write-Host "Please start MySQL service and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ MySQL is running (PID: $($mysqlProcess.Id))" -ForegroundColor Green

# Try to connect and create database
Write-Host ""
Write-Host "Creating database and user..." -ForegroundColor Yellow
Write-Host "You may be prompted for MySQL root password." -ForegroundColor Gray
Write-Host ""

$sqlFile = Join-Path $PSScriptRoot "create-database.sql"

# Option 1: Try without password
Write-Host "Attempting connection..." -ForegroundColor Gray
$result = & mysql -u root -e "source $sqlFile" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Database 'rapidstudy' created successfully!" -ForegroundColor Green
    Write-Host "✓ User 'rapidstudy_user' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database Configuration:" -ForegroundColor Cyan
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 3306" -ForegroundColor White
    Write-Host "  Database: rapidstudy" -ForegroundColor White
    Write-Host "  Username: rapidstudy_user" -ForegroundColor White
    Write-Host "  Password: password" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Change the password in production!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Failed to create database automatically." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual Setup Instructions:" -ForegroundColor Yellow
    Write-Host "1. Open MySQL Workbench or command line" -ForegroundColor White
    Write-Host "2. Run the SQL script: scripts/create-database.sql" -ForegroundColor White
    Write-Host ""
}
