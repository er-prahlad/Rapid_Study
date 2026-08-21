# RapidStudy - Database Verification Script

Write-Host "================================"
Write-Host " Database Verification"
Write-Host "================================"
Write-Host ""

# Check MySQL process
$mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysqlProcess) {
    Write-Host "MySQL is running (PID: $($mysqlProcess[0].Id))"
} else {
    Write-Host "MySQL is not running!"
    exit 1
}

Write-Host ""
Write-Host "Database Connection Settings:"
Write-Host "  Host: localhost"
Write-Host "  Port: 3306"
Write-Host "  Database: rapidstudy"
Write-Host "  Username: root"
Write-Host ""

Write-Host "Expected Tables (from Flyway migrations):"
$expectedTables = @(
    "users",
    "exams", 
    "subjects",
    "topics",
    "questions",
    "options",
    "mock_tests",
    "mock_test_questions",
    "test_attempts",
    "attempt_answers",
    "bookmarks",
    "user_question_progress",
    "study_plans",
    "notifications"
)

foreach ($table in $expectedTables) {
    Write-Host "  - $table"
}

Write-Host ""
Write-Host "Flyway Migrations Created:"
$migrationsPath = "c:\Users\acer\Desktop\Rapid_Study\backend\src\main\resources\db\migration"
if (Test-Path $migrationsPath) {
    $migrations = Get-ChildItem $migrationsPath -Filter "*.sql" | Sort-Object Name
    foreach ($migration in $migrations) {
        Write-Host "  $($migration.Name)"
    }
    Write-Host ""
    Write-Host "Total migrations: $($migrations.Count)"
} else {
    Write-Host "  Migrations directory not found!"
}

Write-Host ""
Write-Host "================================"
Write-Host " Verification Complete"
Write-Host "================================"
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Start the backend application"
Write-Host "2. Flyway will automatically create tables on startup"
Write-Host "3. Check application logs for migration status"
