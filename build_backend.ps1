$env:JAVA_HOME = "C:\Java\jdk21"
Set-Location "C:\Users\acer\Desktop\Rapid_Study\backend"

$mvn = "C:\Users\acer\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"
$log = "C:\Users\acer\Desktop\Rapid_Study\mvn_compile2.log"

$sb  = New-Object System.Text.StringBuilder
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $mvn
$psi.Arguments = "compile --no-transfer-progress"
$psi.WorkingDirectory = "C:\Users\acer\Desktop\Rapid_Study\backend"
$psi.EnvironmentVariables["JAVA_HOME"] = "C:\Java\jdk21"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow  = $true

$p = New-Object System.Diagnostics.Process
$p.StartInfo = $psi

$a = { if ($EventArgs.Data) { $sb.AppendLine($EventArgs.Data) | Out-Null } }
Register-ObjectEvent $p OutputDataReceived $a -SourceIdentifier "C1" | Out-Null
Register-ObjectEvent $p ErrorDataReceived  $a -SourceIdentifier "C2" | Out-Null

$p.Start() | Out-Null
$p.BeginOutputReadLine()
$p.BeginErrorReadLine()
$p.WaitForExit(180000)
Start-Sleep -Seconds 2

Unregister-Event "C1" -ErrorAction SilentlyContinue
Unregister-Event "C2" -ErrorAction SilentlyContinue

$output = $sb.ToString()
[System.IO.File]::WriteAllText($log, $output)

if ($p.ExitCode -eq 0) {
    Write-Host "BUILD SUCCESS"
} else {
    Write-Host "BUILD FAILED"
    $output.Split("`n") | Where-Object { $_ -match "ERROR|error:" } | Write-Host
}
exit $p.ExitCode
