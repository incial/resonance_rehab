# GitHub Secrets Setup for Resonance Rehab
# Run: powershell -ExecutionPolicy Bypass -File setup-secrets.ps1

$Cyan = "Cyan"
$Green = "Green"  
$Yellow = "Yellow"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor $Cyan
Write-Host " GitHub Secrets Setup for Resonance Rehab" -ForegroundColor $Cyan
Write-Host "=====================================================" -ForegroundColor $Cyan
Write-Host ""

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI not installed" -ForegroundColor Red
    exit 1
}

$remoteUrl = git config --get remote.origin.url
Write-Host "Repository: $remoteUrl" -ForegroundColor $Green

Write-Host ""
Write-Host "HOSTINGER GIT DEPLOYMENT" -ForegroundColor $Yellow
$gitHost = Read-Host "Git hostname"
$gitUser = Read-Host "Hosting username"  
$gitRepo = Read-Host "Repository path"

Write-Host ""
Write-Host "FTP FALLBACK" -ForegroundColor $Yellow
$ftpServer = Read-Host "FTP server"
$ftpUser = Read-Host "FTP username"
$ftpPass = Read-Host "FTP password" -AsSecureString | ConvertFrom-SecureString -AsPlainText

Write-Host ""
Write-Host "EMAIL CONFIGURATION" -ForegroundColor $Yellow
$emailServer = Read-Host "SMTP server"
$emailPort = Read-Host "SMTP port"
$emailUser = Read-Host "Sender email"
$emailPass = Read-Host "Email password" -AsSecureString | ConvertFrom-SecureString -AsPlainText
$deployEmail = Read-Host "Recipient email"

Write-Host ""
Write-Host "SSH KEY" -ForegroundColor $Yellow
$sshPath = Read-Host "SSH key path (Enter to generate)"

if ([string]::IsNullOrWhiteSpace($sshPath)) {
    Write-Host "Generating SSH key..." -ForegroundColor $Cyan
    $sshPath = "hostinger_deploy"
    ssh-keygen -t ed25519 -C "github-actions" -f $sshPath -N "" -q
    Write-Host "SSH key generated: $sshPath" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Add this to hPanel:" -ForegroundColor $Yellow
    Get-Content "$sshPath.pub"
    Write-Host ""
    Read-Host "Press Enter when done"
}

if (-not (Test-Path $sshPath)) {
    Write-Host "ERROR: SSH key not found" -ForegroundColor Red
    exit 1
}

$sshKey = Get-Content $sshPath -Raw

Write-Host ""
Write-Host "REVIEW:" -ForegroundColor $Yellow
Write-Host "Git Host: $gitHost"
Write-Host "Git User: $gitUser"
Write-Host "Git Repo: $gitRepo"
Write-Host "FTP Server: $ftpServer"
Write-Host "Email Server: $emailServer"
Write-Host ""

$ok = Read-Host "Continue? (yes/no)"
if ($ok -ne "yes" -and $ok -ne "y") {
    exit 0
}

Write-Host ""
Write-Host "Adding GitHub secrets..." -ForegroundColor $Cyan

$secrets = @{
    HOSTINGER_GIT_HOST = $gitHost
    HOSTINGER_GIT_USER = $gitUser
    HOSTINGER_GIT_REPO = $gitRepo
    HOSTINGER_SSH_KEY = $sshKey
    FTP_SERVER = $ftpServer
    FTP_USERNAME = $ftpUser
    FTP_PASSWORD = $ftpPass
    EMAIL_SERVER = $emailServer
    EMAIL_PORT = $emailPort
    EMAIL_USERNAME = $emailUser
    EMAIL_PASSWORD = $emailPass
    DEPLOYMENT_EMAIL = $deployEmail
}

foreach ($name in $secrets.Keys) {
    Write-Host "  $name..." -NoNewline
    echo $secrets[$name] | gh secret set $name 2>&1 | Out-Null
    Write-Host " OK" -ForegroundColor $Green
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor $Green
Write-Host " SUCCESS! All secrets added" -ForegroundColor $Green
Write-Host "=====================================================" -ForegroundColor $Green
Write-Host ""

Write-Host "Next:" -ForegroundColor $Yellow
Write-Host "1. Verify: gh secret list"
Write-Host "2. Test: git push origin publish"
Write-Host "3. Monitor: GitHub Actions tab"
Write-Host ""
