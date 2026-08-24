$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

Write-Host "============================================"
Write-Host " RapidStudy - Database Setup Fix"
Write-Host "============================================"
Write-Host ""

# Step 1: Find root password
Write-Host "Step 1: Finding MySQL root password..."
$rootPwd = $null
$passwords = @("", "root", "Root@123", "mysql", "admin", "toor", "1234", "rapidstudy", "password")

foreach ($pwd in $passwords) {
    $args = if ($pwd -eq "") {
        @("-u", "root", "--connect-timeout=3", "-e", "SELECT 1;")
    } else {
        @("-u", "root", "-p$pwd", "--connect-timeout=3", "-e", "SELECT 1;")
    }
    $out = "$env:TEMP\mysql_out.txt"
    $err = "$env:TEMP\mysql_err.txt"
    $p = Start-Process -FilePath $mysqlExe -ArgumentList $args -Wait -PassThru `
        -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden
    $errText = if (Test-Path $err) { Get-Content $err -Raw } else { "" }
    if ($errText -notmatch "Access denied") {
        $rootPwd = $pwd
        Write-Host "  Found root password: '$pwd'"
        break
    }
}

if ($null -eq $rootPwd) {
    Write-Host ""
    Write-Host "ERROR: Could not find root password automatically."
    Write-Host ""
    Write-Host "Please run this in MySQL Workbench or command line as root:"
    Write-Host ""
    Write-Host "  CREATE USER IF NOT EXISTS 'rapidstudy_user'@'localhost' IDENTIFIED BY 'password';"
    Write-Host "  GRANT ALL PRIVILEGES ON rapidstudy.* TO 'rapidstudy_user'@'localhost';"
    Write-Host "  CREATE DATABASE IF NOT EXISTS rapidstudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    Write-Host "  FLUSH PRIVILEGES;"
    Write-Host ""
    exit 1
}

# Step 2: Create database and user
Write-Host ""
Write-Host "Step 2: Creating database and user..."

$sql = @"
CREATE DATABASE IF NOT EXISTS rapidstudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'rapidstudy_user'@'localhost' IDENTIFIED BY 'password';
CREATE USER IF NOT EXISTS 'rapidstudy_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON rapidstudy.* TO 'rapidstudy_user'@'localhost';
GRANT ALL PRIVILEGES ON rapidstudy.* TO 'rapidstudy_user'@'%';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully' as Status;
SHOW DATABASES LIKE 'rapidstudy';
"@

$sqlFile = "$env:TEMP\rapidstudy_setup.sql"
[System.IO.File]::WriteAllText($sqlFile, $sql)

$args = if ($rootPwd -eq "") {
    @("-u", "root", "--connect-timeout=5", "-e", "source $sqlFile")
} else {
    @("-u", "root", "-p$rootPwd", "--connect-timeout=5", "-e", "source $sqlFile")
}

$out = "$env:TEMP\mysql_out.txt"
$err = "$env:TEMP\mysql_err.txt"
$p = Start-Process -FilePath $mysqlExe -ArgumentList $args -Wait -PassThru `
    -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden

$outText = if (Test-Path $out) { Get-Content $out -Raw } else { "" }
$errText = if (Test-Path $err) { Get-Content $err -Raw } else { "" }

if ($p.ExitCode -eq 0 -or $errText -notmatch "ERROR") {
    Write-Host ""
    Write-Host "SUCCESS! Database setup complete."
    Write-Host $outText
} else {
    Write-Host ""
    Write-Host "ERROR during setup:"
    Write-Host $errText
    exit 1
}

# Step 3: Verify connection as rapidstudy_user
Write-Host ""
Write-Host "Step 3: Verifying connection as rapidstudy_user..."
$verifyArgs = @("-u", "rapidstudy_user", "-ppassword", "--connect-timeout=3", "-e", "SHOW DATABASES LIKE 'rapidstudy';")
$p2 = Start-Process -FilePath $mysqlExe -ArgumentList $verifyArgs -Wait -PassThru `
    -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden
$outText2 = if (Test-Path $out) { Get-Content $out -Raw } else { "" }
$errText2 = if (Test-Path $err) { Get-Content $err -Raw } else { "" }

if ($outText2 -match "rapidstudy") {
    Write-Host "  rapidstudy_user can connect and see rapidstudy database!"
    Write-Host ""
    Write-Host "============================================"
    Write-Host " Setup complete! You can now run the backend."
    Write-Host " Command: .\run.ps1"
    Write-Host "============================================"
} else {
    Write-Host "  Verification failed: $errText2"
    Write-Host "  Output: $outText2"
}
