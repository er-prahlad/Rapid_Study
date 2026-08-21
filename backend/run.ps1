# RapidStudy Backend Run Script

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host " RapidStudy Backend Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# Verify Java
if (Test-Path "$env:JAVA_HOME\bin\java.exe") {
    Write-Host "✓ Java found" -ForegroundColor Green
} else {
    Write-Host "✗ Java not found at $env:JAVA_HOME" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "API will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Swagger UI will be at: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Run Spring Boot
.\mvnw.cmd spring-boot:run
