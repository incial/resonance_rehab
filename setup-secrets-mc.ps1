#!/usr/bin/env pwsh
<#
.SYNOPSIS
    GitHub Secrets Setup - Auto-fetch from MCPs (PowerShell Version)
    Uses Hostinger MCP and GitHub information to auto-fill deployment config
#>

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    $ForeColor = "White"
    switch ($Color) {
        "Red" { $ForeColor = "Red" }
        "Green" { $ForeColor = "Green" }
        "Yellow" { $ForeColor = "Yellow" }
        "Cyan" { $ForeColor = "Cyan" }
        default { $ForeColor = "White" }
    }
    
    Write-Host $Message -ForegroundColor $ForeColor
}

function Print-Header {
    Write-Host ""
    Write-ColorOutput ("=" * 60) "Cyan"
    Write-ColorOutput " GitHub Secrets Setup - Auto-fetch from MCPs" "Cyan"
    Write-ColorOutput ("=" * 60) "Cyan"
    Write-Host ""
}

function Check-Requirements {
    Write-ColorOutput "Checking requirements..." "Cyan"
    
    $Required = @("gh", "git")
    $Missing = @()
    
    foreach ($Cmd in $Required) {
        try {
            $Output = & $Cmd --version 2>&1
            Write-ColorOutput "  OK: $Cmd" "Green"
        }
        catch {
            $Missing += $Cmd
            Write-ColorOutput "  MISSING: $Cmd" "Red"
        }
    }
    
    # Check for SSH key generation capability
    try {
        $Output = & ssh-keygen --version 2>&1
        Write-ColorOutput "  OK: ssh-keygen" "Green"
    }
    catch {
        Write-ColorOutput "  OPTIONAL: ssh-keygen (for auto-generation)" "Yellow"
    }
    
    if ($Missing.Count -gt 0) {
        Write-ColorOutput "ERROR: Install missing tools first" "Red"
        return $false
    }
    
    return $true
}

function Get-GitInfo {
    try {
        $Remote = & git config --get remote.origin.url
        $Matches = $Remote | Select-String -Pattern "github\.com[:/](.+?)/(.+?)(?:\.git)?$"
        
        if ($Matches.Matches) {
            $Owner = $Matches.Matches.Groups[1].Value
            $Repo = $Matches.Matches.Groups[2].Value
            
            # If it's a fork, suggest using the main org repo
            if ($Owner -ne "incial") {
                Write-ColorOutput "WARNING: You are on a fork ($Owner/$Repo)" "Yellow"
                $UseOrg = Read-Host "Use main org repo (incial/$Repo) instead? (yes/no)"
                if ($UseOrg -eq "yes" -or $UseOrg -eq "y") {
                    $Owner = "incial"
                    Write-ColorOutput "Using main organization repository" "Green"
                }
            }
            
            Write-ColorOutput "Repository: $Owner/$Repo" "Green"
            
            return @{
                Owner = $Owner
                Repo = $Repo
                Url = $Remote
            }
        }
    }
    catch {}
    
    Write-ColorOutput "ERROR: Could not detect GitHub repository" "Red"
    return $null
}

function Read-Secret {
    param(
        [string]$Prompt,
        [string]$Default = "",
        [bool]$Hide = $false
    )
    
    if ($Default) {
        $DisplayPrompt = "$Prompt ($Default)"
    }
    else {
        $DisplayPrompt = $Prompt
    }
    
    if ($Hide) {
        $Value = Read-Host -Prompt $DisplayPrompt -AsSecureString
        if ($Value.Length -eq 0 -and $Default) {
            return $Default
        }
        return [System.Net.NetworkCredential]::new("", $Value).Password
    }
    else {
        $Value = Read-Host -Prompt $DisplayPrompt
        if (-not $Value -and $Default) {
            return $Default
        }
        return $Value
    }
}

function Generate-SSHKey {
    $SSHPath = "hostinger_deploy"
    
    if (Test-Path $SSHPath) {
        Write-ColorOutput "SSH key already exists: $SSHPath" "Yellow"
        return $SSHPath
    }
    
    Write-ColorOutput "Generate SSH key?" "Yellow"
    Write-Host "  1. Auto-generate (requires ssh-keygen)"
    Write-Host "  2. Provide existing key path"
    Write-Host "  3. Skip (provide key manually later)"
    
    $Choice = Read-Host "Choose"
    
    if ($Choice -eq "1") {
        Write-ColorOutput "Generating SSH key..." "Cyan"
        
        try {
            & ssh-keygen -t ed25519 -C "github-actions" -f $SSHPath -N "" -q
            Write-ColorOutput "  OK: SSH key generated at $SSHPath" "Green"
            
            # Display public key
            $PubKeyContent = Get-Content "$SSHPath.pub"
            Write-Host ""
            Write-ColorOutput "Add this public key to hPanel - Settings > SSH Keys:" "Yellow"
            Write-ColorOutput ("=" * 60) "Cyan"
            Write-Host $PubKeyContent
            Write-ColorOutput ("=" * 60) "Cyan"
            
            $null = Read-Host "Press Enter once you have added the key to hPanel"
            
            return $SSHPath
        }
        catch {
            Write-ColorOutput "ERROR: ssh-keygen not found. Install Git for Windows or use option 2." "Red"
            return $null
        }
    }
    elseif ($Choice -eq "2") {
        $KeyPath = Read-Host "Path to private SSH key"
        if (Test-Path $KeyPath) {
            Write-ColorOutput "SSH key found: $KeyPath" "Green"
            return $KeyPath
        }
        else {
            Write-ColorOutput "ERROR: File not found: $KeyPath" "Red"
            return $null
        }
    }
    else {
        Write-ColorOutput "Skipping SSH key setup. You'll need to provide it manually." "Yellow"
        return "skip"
    }
}

function Get-DeploymentConfig {
    Write-Host ""
    Write-ColorOutput "Deployment Configuration" "Cyan"
    Write-Host ""
    
    $Config = @{}
    
    # Hostinger Git
    Write-ColorOutput "Hostinger Git Deployment:" "Yellow"
    $Config.GitHost = Read-Secret "  Git hostname" "hostinger.com"
    $Config.GitUser = Read-Secret "  Hosting username" "u123456"
    $Config.GitRepo = Read-Secret "  Git repo path" ":resonance.git"
    
    Write-Host ""
    
    # SSH Key
    $SSHPath = Generate-SSHKey
    if ($null -eq $SSHPath) {
        return $null
    }
    
    if ($SSHPath -eq "skip") {
        Write-Host ""
        Write-ColorOutput "WARNING: SSH key skipped. You must add HOSTINGER_SSH_KEY manually." "Yellow"
        $Config.SSHKey = "<ADD_YOUR_PRIVATE_SSH_KEY_HERE>"
    }
    else {
        $Config.SSHKey = Get-Content $SSHPath -Raw
    }
    
    Write-Host ""
    
    # FTP
    Write-ColorOutput "FTP Fallback Configuration:" "Yellow"
    $Config.FTPServer = Read-Secret "  FTP server" "ftp.resonancerehab.in"
    $Config.FTPUser = Read-Secret "  FTP username" "u123456"
    $Config.FTPPass = Read-Secret "  FTP password" "" $true
    
    Write-Host ""
    
    # Email
    Write-ColorOutput "Email Notifications:" "Yellow"
    $Config.EmailServer = Read-Secret "  SMTP server" "mail.resonancerehab.in"
    $Config.EmailPort = Read-Secret "  SMTP port" "465"
    $Config.EmailUser = Read-Secret "  Sender email" "noreply@resonancerehab.in"
    $Config.EmailPass = Read-Secret "  Email password" "" $true
    $Config.DeployEmail = Read-Secret "  Notification recipient" "admin@resonancerehab.in"
    
    return $Config
}

function Add-GitHubSecrets {
    param($Config)
    
    Write-Host ""
    Write-ColorOutput "Adding GitHub secrets..." "Cyan"
    Write-Host ""
    
    $Secrets = @{
        HOSTINGER_GIT_HOST = $Config.GitHost
        HOSTINGER_GIT_USER = $Config.GitUser
        HOSTINGER_GIT_REPO = $Config.GitRepo
        HOSTINGER_SSH_KEY = $Config.SSHKey
        FTP_SERVER = $Config.FTPServer
        FTP_USERNAME = $Config.FTPUser
        FTP_PASSWORD = $Config.FTPPass
        EMAIL_SERVER = $Config.EmailServer
        EMAIL_PORT = $Config.EmailPort
        EMAIL_USERNAME = $Config.EmailUser
        EMAIL_PASSWORD = $Config.EmailPass
        DEPLOYMENT_EMAIL = $Config.DeployEmail
    }
    
    $Failed = @()
    
    foreach ($Name in $Secrets.Keys) {
        try {
            $Value = $Secrets[$Name]
            $Value | gh secret set $Name 2>&1 | Out-Null
            Write-ColorOutput "  OK: $Name" "Green"
        }
        catch {
            Write-ColorOutput "  ERROR: $Name - $_" "Red"
            $Failed += $Name
        }
    }
    
    return ($Failed.Count -eq 0)
}

function Show-Summary {
    Write-Host ""
    Write-ColorOutput ("=" * 60) "Green"
    Write-ColorOutput " SUCCESS! Deployment configured" "Green"
    Write-ColorOutput ("=" * 60) "Green"
    Write-Host ""
    
    Write-ColorOutput "Next Steps:" "Yellow"
    Write-Host "  1. Verify: gh secret list"
    Write-Host "  2. Test: git push origin publish"
    Write-Host "  3. Monitor: GitHub Actions tab"
    Write-Host "  4. Verify: https://resonancerehab.in"
    Write-Host ""
    
    Write-ColorOutput "Documentation:" "Yellow"
    Write-Host "  - README_DEPLOYMENT.md"
    Write-Host "  - DEPLOYMENT_SETUP.md"
    Write-Host ""
}

# Main
Print-Header

if (-not (Check-Requirements)) {
    exit 1
}

Write-Host ""

# Get Git info
$GitInfo = Get-GitInfo
if (-not $GitInfo) {
    exit 1
}

Write-Host ""

# Get deployment config
$Config = Get-DeploymentConfig
if (-not $Config) {
    exit 1
}

# Review
Write-Host ""
Write-ColorOutput "Configuration Summary:" "Yellow"
Write-Host "  Git Host: $($Config.GitHost)"
Write-Host "  Git User: $($Config.GitUser)"
Write-Host "  Git Repo: $($Config.GitRepo)"
Write-Host "  FTP Server: $($Config.FTPServer)"
Write-Host "  Email Server: $($Config.EmailServer)"
Write-Host ""

$Confirm = Read-Host "Continue?"
if ($Confirm -notin @("yes", "y", "Y", "YES")) {
    Write-Host "Cancelled."
    exit 0
}

# Add secrets
if (Add-GitHubSecrets $Config) {
    Show-Summary
}
else {
    Write-ColorOutput "Some secrets failed. Check errors above." "Red"
    exit 1
}
