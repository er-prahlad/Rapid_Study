Set-Location "C:\Users\acer\Desktop\Rapid_Study\frontend"
$output = npm run build 2>&1 | Out-String
[System.IO.File]::WriteAllText("C:\Users\acer\Desktop\Rapid_Study\frontend_build.log", $output)
if ($LASTEXITCODE -eq 0) {
    Write-Host "BUILD SUCCESS"
} else {
    Write-Host "BUILD FAILED"
    Write-Host $output
}
exit $LASTEXITCODE
