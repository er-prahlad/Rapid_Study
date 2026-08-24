# RapidStudy Backend - Start Server
# Run this from the backend/ directory

$env:JAVA_HOME = "C:\Java\jdk21"
$env:Path = "C:\Java\jdk21\bin;$env:Path"

$mvn = "C:\Users\acer\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"

Write-Host "================================"
Write-Host " RapidStudy Backend Starting..."
Write-Host " URL: http://localhost:8080"
Write-Host " Swagger: http://localhost:8080/swagger-ui.html"
Write-Host " Press Ctrl+C to stop"
Write-Host "================================"

Set-Location $PSScriptRoot
& $mvn spring-boot:run
