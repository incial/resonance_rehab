#!/bin/bash

# GitHub Secrets Setup Script for Resonance Rehab Deployment
# This script helps you add all required secrets to your GitHub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Resonance Rehab - GitHub Secrets Setup Helper        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗ GitHub CLI is not installed.${NC}"
    echo -e "${YELLOW}Please install it from: https://cli.github.com/${NC}"
    exit 1
fi

# Verify we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}✗ Not in a git repository. Please run this script from the repository root.${NC}"
    exit 1
fi

# Get repository name
REPO=$(git config --get remote.origin.url | sed 's/^.*:\|\.git$//' | awk -F'/' '{print $NF}')
OWNER=$(git config --get remote.origin.url | sed 's/^.*:\|\.git$//' | awk -F'/' '{print $(NF-1)}')

echo -e "${GREEN}✓ Repository detected: ${OWNER}/${REPO}${NC}"
echo ""

# Function to read input with validation
read_secret() {
    local prompt="$1"
    local variable_name="$2"
    local is_hidden="$3"
    
    while true; do
        if [ "$is_hidden" = "true" ]; then
            read -sp "$(echo -e ${YELLOW}${prompt}${NC}): " value
            echo ""
        else
            read -p "$(echo -e ${YELLOW}${prompt}${NC}): " value
        fi
        
        if [ -z "$value" ]; then
            echo -e "${RED}✗ Value cannot be empty. Please try again.${NC}"
            continue
        fi
        
        # Confirm if it's a sensitive value
        if [ "$is_hidden" = "true" ]; then
            read -sp "$(echo -e ${YELLOW}Confirm ${variable_name}${NC}): " confirm
            echo ""
            if [ "$value" != "$confirm" ]; then
                echo -e "${RED}✗ Values don't match. Please try again.${NC}"
                continue
            fi
        fi
        
        echo "$value"
        break
    done
}

# Setup function
setup_secrets() {
    echo -e "${BLUE}Hostinger Git Deployment Configuration${NC}"
    echo ""
    
    GIT_HOST=$(read_secret "Enter Hostinger Git hostname (e.g., hostinger.com)" "HOSTINGER_GIT_HOST")
    GIT_USER=$(read_secret "Enter Hostinger hosting username (e.g., u123456)" "HOSTINGER_GIT_USER")
    GIT_REPO=$(read_secret "Enter Hostinger Git repository path (e.g., :resonance.git)" "HOSTINGER_GIT_REPO")
    
    echo ""
    echo -e "${YELLOW}SSH Key Setup${NC}"
    echo -e "${BLUE}Do you have an SSH key already generated?${NC}"
    read -p "Enter path to private SSH key (leave empty to generate new): " ssh_key_path
    
    if [ -z "$ssh_key_path" ]; then
        echo -e "${BLUE}Generating new SSH key...${NC}"
        ssh_key_path="hostinger_deploy"
        ssh-keygen -t ed25519 -C "github-actions-${REPO}" -f "$ssh_key_path" -N ""
        echo -e "${GREEN}✓ SSH key generated: ${ssh_key_path}${NC}"
        echo -e "${YELLOW}Please add the public key to hPanel:${NC}"
        cat ${ssh_key_path}.pub
        echo ""
        read -p "Press Enter once you've added the public key to hPanel..."
    fi
    
    if [ ! -f "$ssh_key_path" ]; then
        echo -e "${RED}✗ SSH key file not found: ${ssh_key_path}${NC}"
        exit 1
    fi
    
    SSH_KEY=$(cat "$ssh_key_path")
    
    echo ""
    echo -e "${BLUE}FTP Configuration (Fallback)${NC}"
    FTP_SERVER=$(read_secret "Enter FTP server address" "FTP_SERVER")
    FTP_USERNAME=$(read_secret "Enter FTP username" "FTP_USERNAME")
    FTP_PASSWORD=$(read_secret "Enter FTP password" "FTP_PASSWORD" "true")
    
    echo ""
    echo -e "${BLUE}Email Configuration${NC}"
    EMAIL_SERVER=$(read_secret "Enter SMTP server address (e.g., mail.resonancerehab.in)" "EMAIL_SERVER")
    EMAIL_PORT=$(read_secret "Enter SMTP port (465 or 587)" "EMAIL_PORT")
    EMAIL_USERNAME=$(read_secret "Enter sender email address" "EMAIL_USERNAME")
    EMAIL_PASSWORD=$(read_secret "Enter email password" "EMAIL_PASSWORD" "true")
    DEPLOYMENT_EMAIL=$(read_secret "Enter recipient email (for notifications)" "DEPLOYMENT_EMAIL")
    
    echo ""
    echo -e "${BLUE}Review Your Secrets${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}Hostinger Git:${NC}"
    echo "  HOST: ${GREEN}${GIT_HOST}${NC}"
    echo "  USER: ${GREEN}${GIT_USER}${NC}"
    echo "  REPO: ${GREEN}${GIT_REPO}${NC}"
    echo ""
    echo -e "${YELLOW}FTP:${NC}"
    echo "  SERVER: ${GREEN}${FTP_SERVER}${NC}"
    echo "  USERNAME: ${GREEN}${FTP_USERNAME}${NC}"
    echo "  PASSWORD: ${GREEN}[HIDDEN]${NC}"
    echo ""
    echo -e "${YELLOW}Email:${NC}"
    echo "  SERVER: ${GREEN}${EMAIL_SERVER}${NC}"
    echo "  PORT: ${GREEN}${EMAIL_PORT}${NC}"
    echo "  USERNAME: ${GREEN}${EMAIL_USERNAME}${NC}"
    echo "  PASSWORD: ${GREEN}[HIDDEN]${NC}"
    echo "  RECIPIENT: ${GREEN}${DEPLOYMENT_EMAIL}${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Continue with creating GitHub secrets? (y/n)${NC}): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${YELLOW}Setup cancelled.${NC}"
        exit 0
    fi
    
    # Create secrets
    echo ""
    echo -e "${BLUE}Adding secrets to GitHub...${NC}"
    
    secrets=(
        "HOSTINGER_GIT_HOST:$GIT_HOST"
        "HOSTINGER_GIT_USER:$GIT_USER"
        "HOSTINGER_GIT_REPO:$GIT_REPO"
        "HOSTINGER_SSH_KEY:$SSH_KEY"
        "FTP_SERVER:$FTP_SERVER"
        "FTP_USERNAME:$FTP_USERNAME"
        "FTP_PASSWORD:$FTP_PASSWORD"
        "EMAIL_SERVER:$EMAIL_SERVER"
        "EMAIL_PORT:$EMAIL_PORT"
        "EMAIL_USERNAME:$EMAIL_USERNAME"
        "EMAIL_PASSWORD:$EMAIL_PASSWORD"
        "DEPLOYMENT_EMAIL:$DEPLOYMENT_EMAIL"
    )
    
    for secret in "${secrets[@]}"; do
        IFS=':' read -r name value <<< "$secret"
        echo -n "Adding $name... "
        echo "$value" | gh secret set "$name" 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
    done
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ All secrets have been added to GitHub!             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Verify all secrets: gh secret list"
    echo "2. Make a test commit to the 'publish' branch"
    echo "3. Watch the deployment in Actions tab"
    echo "4. Check your email for deployment notifications"
    echo ""
    echo -e "${YELLOW}SSH Key File Location:${NC} ${ssh_key_path}"
    echo -e "${YELLOW}Documentation: DEPLOYMENT_SETUP.md${NC}"
}

# Run setup
setup_secrets
