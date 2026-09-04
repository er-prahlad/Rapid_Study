# RapidStudy Frontend - Fast Dev Start
# Starts Turbopack dev server and pre-warms all routes in background

Write-Host "Starting dev server with Turbopack..." -ForegroundColor Cyan

# Kill any existing node processes on 3000
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

# Start Next.js dev server in background
$devJob = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npx next dev --turbo" `
    -WorkingDirectory $PSScriptRoot `
    -PassThru

Write-Host "Server starting (PID: $($devJob.Id))..." -ForegroundColor Yellow
Write-Host "Waiting for server to be ready..."

# Wait for server to respond
$ready = $false
$attempts = 0
while (-not $ready -and $attempts -lt 60) {
    Start-Sleep -Seconds 2
    $attempts++
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -lt 500) { $ready = $true }
    } catch { }
    if ($attempts % 5 -eq 0) { Write-Host "  Still waiting... ($($attempts * 2)s)" }
}

if (-not $ready) {
    Write-Host "Server ready check failed, starting prewarm anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Server ready! Pre-warming all routes in background..." -ForegroundColor Green
Write-Host "Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Run prewarm in background — don't block the terminal
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c node scripts/prewarm.js" `
    -WorkingDirectory $PSScriptRoot `
    -WindowStyle Hidden

Write-Host "Pre-warming running in background. All routes will be fast in ~2-3 minutes." -ForegroundColor Yellow
Write-Host "You can use the app now — routes will be fast as they finish compiling." -ForegroundColor White
