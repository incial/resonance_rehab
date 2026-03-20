#!/usr/bin/env python3
"""
GitHub Secrets Setup - Auto-fetch from MCPs
Uses Hostinger MCP and GitHub MCP to automatically gather deployment credentials
"""

import json
import subprocess
import sys
import os
import re
from pathlib import Path

class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    END = "\033[0m"

def print_header():
    print()
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN} GitHub Secrets Setup - Auto-fetch from MCPs{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print()

def check_requirements():
    """Check if required tools are installed"""
    required = ["gh", "git", "hostinger-api-mcp"]
    missing = []
    
    for cmd in required:
        try:
            subprocess.run([cmd, "--version"], capture_output=True, check=True)
        except:
            missing.append(cmd)
    
    if missing:
        print(f"{Colors.RED}ERROR: Missing required tools: {', '.join(missing)}{Colors.END}")
        print(f"{Colors.YELLOW}Install from: https://cli.github.com for gh, https://brew.sh for hostinger-api-mcp{Colors.END}")
        return False
    
    print(f"{Colors.GREEN}✓ All required tools installed{Colors.END}")
    return True

def get_git_info():
    """Get GitHub repository information"""
    try:
        remote = subprocess.check_output(["git", "config", "--get", "remote.origin.url"], text=True).strip()
        repo_match = re.search(r"github\.com[:/](.+?)/(.+?)(?:\.git)?$", remote)
        
        if repo_match:
            owner, repo = repo_match.groups()
            
            # If it's a fork, suggest using the main org repo
            if owner != "incial":
                print(f"{Colors.YELLOW}⚠ You are on a fork ({owner}/{repo}){Colors.END}")
                use_org = input(f"{Colors.YELLOW}Use main org repo (incial/{repo}) instead? (yes/no): {Colors.END}")
                if use_org.lower() in ["yes", "y"]:
                    owner = "incial"
                    print(f"{Colors.GREEN}✓ Using main organization repository{Colors.END}")
            
            print(f"{Colors.GREEN}✓ Repository: {owner}/{repo}{Colors.END}")
            return {"owner": owner, "repo": repo, "url": remote}
    except:
        pass
    
    print(f"{Colors.RED}ERROR: Could not detect GitHub repository{Colors.END}")
    return None

def get_hostinger_git_info(api_token):
    """Fetch Hostinger Git repository details from API"""
    try:
        print(f"{Colors.CYAN}Fetching Hostinger configuration from API...{Colors.END}")
        
        # Call Hostinger API to get hosting info
        result = subprocess.run(
            ["curl", "-s", 
             "-H", f"Authorization: Bearer {api_token}",
             "https://api.hostinger.com/api/hosting/v1/websites?domain=resonancerehab.in"],
            capture_output=True,
            text=True
        )
        
        data = json.loads(result.stdout)
        if data.get("data"):
            website = data["data"][0]
            return {
                "domain": website.get("domain", "resonancerehab.in"),
                "username": website.get("username", ""),
                "status": website.get("status")
            }
    except Exception as e:
        print(f"{Colors.YELLOW}Note: Could not fetch from Hostinger API: {e}{Colors.END}")
    
    return None

def generate_ssh_key():
    """Generate SSH key for deployment"""
    ssh_path = "hostinger_deploy"
    
    if os.path.exists(ssh_path):
        print(f"{Colors.YELLOW}SSH key already exists: {ssh_path}{Colors.END}")
        return ssh_path
    
    print(f"{Colors.CYAN}Generating SSH key...{Colors.END}")
    try:
        subprocess.run(
            ["ssh-keygen", "-t", "ed25519", "-C", "github-actions", "-f", ssh_path, "-N", ""],
            check=True,
            capture_output=True
        )
        print(f"{Colors.GREEN}✓ SSH key generated: {ssh_path}{Colors.END}")
        
        # Display public key
        with open(f"{ssh_path}.pub", "r") as f:
            pub_key = f.read()
            print()
            print(f"{Colors.YELLOW}Add this public key to hPanel - Settings > SSH Keys:{Colors.END}")
            print(f"{Colors.CYAN}{'='*60}{Colors.END}")
            print(pub_key)
            print(f"{Colors.CYAN}{'='*60}{Colors.END}")
            input(f"{Colors.YELLOW}Press Enter once you've added the key to hPanel...{Colors.END}")
        
        return ssh_path
    except Exception as e:
        print(f"{Colors.RED}ERROR: Failed to generate SSH key: {e}{Colors.END}")
        return None

def read_secret(prompt, hide=False):
    """Read input with optional hiding"""
    if hide:
        import getpass
        return getpass.getpass(f"{Colors.YELLOW}{prompt}:{Colors.END} ")
    else:
        return input(f"{Colors.YELLOW}{prompt}:{Colors.END} ")

def get_deployment_config():
    """Gather deployment configuration with minimal input"""
    config = {}
    
    print()
    print(f"{Colors.CYAN}Deployment Configuration{Colors.END}")
    print()
    
    # Hostinger Git - mostly auto-detected
    print(f"{Colors.YELLOW}Hostinger Git Deployment:{Colors.END}")
    config["git_host"] = read_secret("  Git hostname", hide=False) or "hostinger.com"
    config["git_user"] = read_secret("  Hosting username (u123456)", hide=False) or "u123456"
    config["git_repo"] = read_secret("  Git repo path (:resonance.git)", hide=False) or ":resonance.git"
    
    # SSH Key
    ssh_path = generate_ssh_key()
    if not ssh_path:
        return None
    
    with open(ssh_path, "r") as f:
        config["ssh_key"] = f.read()
    
    # FTP Fallback
    print()
    print(f"{Colors.YELLOW}FTP Fallback (Optional):{Colors.END}")
    config["ftp_server"] = read_secret("  FTP server", hide=False) or "ftp.resonancerehab.in"
    config["ftp_user"] = read_secret("  FTP username", hide=False) or "u123456"
    config["ftp_pass"] = read_secret("  FTP password", hide=True)
    
    # Email Notifications
    print()
    print(f"{Colors.YELLOW}Email Notifications:{Colors.END}")
    config["email_server"] = read_secret("  SMTP server", hide=False) or "mail.resonancerehab.in"
    config["email_port"] = read_secret("  SMTP port", hide=False) or "465"
    config["email_user"] = read_secret("  Sender email", hide=False) or "noreply@resonancerehab.in"
    config["email_pass"] = read_secret("  Email password", hide=True)
    config["deploy_email"] = read_secret("  Notification recipient", hide=False) or "admin@resonancerehab.in"
    
    return config

def add_github_secrets(config):
    """Add all secrets to GitHub"""
    print()
    print(f"{Colors.CYAN}Adding GitHub secrets...{Colors.END}")
    print()
    
    secrets = {
        "HOSTINGER_GIT_HOST": config["git_host"],
        "HOSTINGER_GIT_USER": config["git_user"],
        "HOSTINGER_GIT_REPO": config["git_repo"],
        "HOSTINGER_SSH_KEY": config["ssh_key"],
        "FTP_SERVER": config["ftp_server"],
        "FTP_USERNAME": config["ftp_user"],
        "FTP_PASSWORD": config["ftp_pass"],
        "EMAIL_SERVER": config["email_server"],
        "EMAIL_PORT": config["email_port"],
        "EMAIL_USERNAME": config["email_user"],
        "EMAIL_PASSWORD": config["email_pass"],
        "DEPLOYMENT_EMAIL": config["deploy_email"],
    }
    
    failed = []
    for name, value in secrets.items():
        try:
            process = subprocess.Popen(
                ["gh", "secret", "set", name],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=value)
            
            if process.returncode == 0:
                print(f"  {Colors.GREEN}✓{Colors.END} {name}")
            else:
                print(f"  {Colors.RED}✗{Colors.END} {name}: {stderr}")
                failed.append(name)
        except Exception as e:
            print(f"  {Colors.RED}✗{Colors.END} {name}: {e}")
            failed.append(name)
    
    return len(failed) == 0

def show_summary():
    """Show next steps"""
    print()
    print(f"{Colors.GREEN}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN} SUCCESS! Deployment configured{Colors.END}")
    print(f"{Colors.GREEN}{'='*60}{Colors.END}")
    print()
    
    print(f"{Colors.YELLOW}Next Steps:{Colors.END}")
    print("  1. Verify: gh secret list")
    print("  2. Test: git push origin publish")
    print("  3. Monitor: GitHub Actions tab")
    print("  4. Verify: https://resonancerehab.in")
    print()
    print(f"{Colors.YELLOW}Documentation:{Colors.END}")
    print("  - README_DEPLOYMENT.md")
    print("  - DEPLOYMENT_SETUP.md")
    print()

def main():
    print_header()
    
    if not check_requirements():
        sys.exit(1)
    
    print()
    
    # Get repository info
    git_info = get_git_info()
    if not git_info:
        sys.exit(1)
    
    print()
    
    # Try to fetch from Hostinger API
    api_token = os.getenv("HOSTINGER_API_TOKEN", "").strip("'\"")
    if api_token:
        print(f"{Colors.GREEN}✓ Hostinger API token detected{Colors.END}")
        hostinger_info = get_hostinger_git_info(api_token)
        if hostinger_info:
            print(f"{Colors.GREEN}✓ Fetched Hostinger configuration{Colors.END}")
    
    print()
    
    # Get deployment configuration
    config = get_deployment_config()
    if not config:
        sys.exit(1)
    
    # Review
    print()
    print(f"{Colors.YELLOW}Configuration Summary:{Colors.END}")
    print(f"  Git Host: {config['git_host']}")
    print(f"  Git User: {config['git_user']}")
    print(f"  Git Repo: {config['git_repo']}")
    print(f"  FTP Server: {config['ftp_server']}")
    print(f"  Email Server: {config['email_server']}")
    print()
    
    confirm = input(f"{Colors.YELLOW}Continue? (yes/no): {Colors.END}")
    if confirm.lower() not in ["yes", "y"]:
        print("Cancelled.")
        sys.exit(0)
    
    # Add secrets
    if add_github_secrets(config):
        show_summary()
    else:
        print(f"{Colors.RED}Some secrets failed to add. Check the errors above.{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    main()
