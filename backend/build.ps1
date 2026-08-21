# RapidStudy Backend Build Script

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host " RapidStudy Backend Build" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# Verify Java
if (Test-Path "$env:JAVA_HOME\bin\java.exe") {
    Write-Host "✓ Java found" -ForegroundColor Green
    & "$env:JAVA_HOME\bin\java.exe" -version
} else {
    Write-Host "✗ Java not found at $env:JAVA_HOME" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building backend..." -ForegroundColor Yellow
Write-Host ""

# Run Maven wrapper
.\mvnw.cmd clean install -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Backend built successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
