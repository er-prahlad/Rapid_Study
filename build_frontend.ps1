Set-Location "C:\Users\acer\Desktop\Rapid_Study\frontend"
$log = "C:\Users\acer\Desktop\Rapid_Study\frontend_build.log"

$sb = New-Object System.Text.StringBuilder
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"; $psi.Arguments = "/c npm run build"
$psi.WorkingDirectory = "C:\Users\acer\Desktop\Rapid_Study\frontend"
$psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
$psi.UseShellExecute = $false; $psi.CreateNoWindow = $true

$p = New-Object System.Diagnostics.Process; $p.StartInfo = $psi
$a = { if ($EventArgs.Data) { $sb.AppendLine($EventArgs.Data) | Out-Null } }
Register-ObjectEvent $p OutputDataReceived $a -SourceIdentifier "FBuild1" | Out-Null
Register-ObjectEvent $p ErrorDataReceived  $a -SourceIdentifier "FBuild2" | Out-Null
$p.Start() | Out-Null; $p.BeginOutputReadLine(); $p.BeginErrorReadLine()
$p.WaitForExit(300000); Start-Sleep 3
Unregister-Event "FBuild1" -EA SilentlyContinue; Unregister-Event "FBuild2" -EA SilentlyContinue

$output = $sb.ToString()
[System.IO.File]::WriteAllText($log, $output)

Write-Host "Exit=$($p.ExitCode)"
if ($p.ExitCode -eq 0) {
    Write-Host "BUILD SUCCESS"
} else {
    Write-Host "BUILD FAILED"
    $output.Split("`n") | Where-Object { $_ -match "error TS|Type error|Failed" } | Select-Object -First 20 | Write-Host
}
exit $p.ExitCode
