$env:JAVA_HOME = "C:\Java\jdk21"
$mvn = "C:\Users\acer\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"
$log = "C:\Users\acer\Desktop\Rapid_Study\mvn_out.log"

$sb  = New-Object System.Text.StringBuilder
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $mvn; $psi.Arguments = "clean compile --no-transfer-progress"
$psi.WorkingDirectory = "C:\Users\acer\Desktop\Rapid_Study\backend"
$psi.EnvironmentVariables["JAVA_HOME"] = "C:\Java\jdk21"
$psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
$psi.UseShellExecute = $false; $psi.CreateNoWindow = $true

$p = New-Object System.Diagnostics.Process; $p.StartInfo = $psi
$a = { if ($EventArgs.Data) { $sb.AppendLine($EventArgs.Data) | Out-Null } }
Register-ObjectEvent $p OutputDataReceived $a -SourceIdentifier "MC1" | Out-Null
Register-ObjectEvent $p ErrorDataReceived  $a -SourceIdentifier "MC2" | Out-Null
$p.Start() | Out-Null; $p.BeginOutputReadLine(); $p.BeginErrorReadLine()
$p.WaitForExit(300000); Start-Sleep 2
Unregister-Event "MC1" -EA SilentlyContinue; Unregister-Event "MC2" -EA SilentlyContinue
$out = $sb.ToString()
[System.IO.File]::WriteAllText($log, $out)
if ($p.ExitCode -eq 0) {
    Write-Host "BUILD SUCCESS"
} else {
    Write-Host "BUILD FAILED - errors:"
    $out.Split("`n") | Where-Object { $_ -match "\[ERROR\]" } | Write-Host
}
exit $p.ExitCode
