# ⚡ Deployment Setup Checklist

Use this checklist to ensure everything is configured for automatic deployments.

## 📋 Configuration Files

- [x] **`.github/workflows/deploy.yml`** - GitHub Actions workflow
  - Triggers on `publish` branch pushes
  - Builds with pnpm
  - Deploys to `/public_html/react/`
  - Falls back to FTP if Git fails
  - Sends GitHub comments and email notifications

- [x] **`.mcp.json`** - Hostinger MCP Configuration
  - Contains Hostinger API token
  - Added to `.gitignore` for security
  - Already set up and ready to use

- [x] **`.gitignore`** - Updated
  - `.mcp.json` excluded from commits
  - Protects sensitive API keys

---

## 🔐 GitHub Secrets Required

**Location**: Settings → Secrets and Variables → Actions

### Hostinger Git Deployment
- [ ] `HOSTINGER_GIT_HOST` - Git server hostname (e.g., `hostinger.com`)
- [ ] `HOSTINGER_GIT_USER` - Hosting username (e.g., `u123456`)
- [ ] `HOSTINGER_GIT_REPO` - Git repo path (e.g., `:resonance.git`)
- [ ] `HOSTINGER_SSH_KEY` - Private SSH key for authentication

### FTP Fallback
- [ ] `FTP_SERVER` - FTP server address
- [ ] `FTP_USERNAME` - FTP username
- [ ] `FTP_PASSWORD` - FTP password

### Email Notifications
- [ ] `EMAIL_SERVER` - SMTP server
- [ ] `EMAIL_PORT` - SMTP port (465 or 587)
- [ ] `EMAIL_USERNAME` - Sender email
- [ ] `EMAIL_PASSWORD` - Email password
- [ ] `DEPLOYMENT_EMAIL` - Recipient email

---

## 🔧 Hostinger Configuration

### Step 1: Enable Git Deployment
- [ ] Log in to **hPanel**
- [ ] Navigate to **Git Repositories** (or **Hosting** → **Git**)
- [ ] Enable Git deployment for your account
- [ ] Create a Git repository for `resonancerehab.in`
- [ ] Copy the Git SSH URL

### Step 2: Set Up SSH Keys
- [ ] Generate SSH key: `ssh-keygen -t ed25519 -C "github-actions" -f hostinger_deploy -N ""`
- [ ] In hPanel, go to **Settings** → **SSH Keys**
- [ ] Add the public key (`hostinger_deploy.pub`)
- [ ] Copy the private key (`hostinger_deploy`) to `HOSTINGER_SSH_KEY` secret

### Step 3: Get Git Details
- [ ] From hPanel Git Repositories, extract:
  - `HOSTINGER_GIT_HOST` (from SSH URL)
  - `HOSTINGER_GIT_USER` (from SSH URL)
  - `HOSTINGER_GIT_REPO` (the repository path)

### Step 4: Configure FTP (Fallback)
- [ ] In hPanel, get your FTP credentials
- [ ] Verify FTP server is enabled
- [ ] Test FTP access with FileZilla or similar

### Step 5: Verify Directory Structure
- [ ] Ensure `/public_html/` exists
- [ ] Ensure `/public_html/react/` exists (or it will be created)

---

## 📧 Email Setup

### For Gmail Users
- [ ] Enable 2-Factor Authentication in Gmail
- [ ] Generate an [App Password](https://myaccount.google.com/apppasswords)
- [ ] Use the app password in `EMAIL_PASSWORD` secret
- [ ] Set `EMAIL_SERVER` to `smtp.gmail.com`
- [ ] Set `EMAIL_PORT` to `587`

### For Hostinger Email
- [ ] In hPanel, find your SMTP settings under **Email**
- [ ] Use provided SMTP server and credentials
- [ ] Usually:
  - `EMAIL_SERVER`: `mail.resonancerehab.in`
  - `EMAIL_PORT`: `465` or `587`

### For Other Email Providers
- [ ] Contact your email provider for SMTP details
- [ ] Ensure "Less secure apps" or similar is enabled if needed

---

## 🚀 How It Works

```
You push to 'publish' branch
    ↓
GitHub Actions starts workflow
    ↓
1. Installs dependencies (pnpm ci)
    ↓
2. Builds project (pnpm build)
    ↓
3. Prepares deployment files
    ↓
4. Deploys via Git (primary)
    ├─ If success → Notifications sent ✅
    └─ If fails → Falls back to FTP
         └─ If FTP success → Notifications sent ✅
             └─ If FTP fails → Error notification ❌
```

---

## ✅ Verification Steps

After setting up all secrets:

### 1. Test Git Connection
```bash
# SSH into your hosting
ssh -i hostinger_deploy u123456@hostinger.com

# Or test Git clone
git clone ssh://hostinger_git@hostinger.com:resonance.git test-clone
```

### 2. Test FTP Connection
```bash
# Using ftp command or FileZilla
ftp ftp.resonancerehab.in
# Login with username and password
```

### 3. Test Email
- [ ] Send a test email from your SMTP server
- [ ] Verify it arrives in inbox
- [ ] Check spam folder

### 4. Manual Workflow Trigger
```bash
gh workflow run deploy.yml --ref publish
```

### 5. Monitor First Deployment
- [ ] Go to Actions tab in your repository
- [ ] Watch the workflow run
- [ ] Check logs for any errors
- [ ] Verify notification email received
- [ ] Visit https://resonancerehab.in to confirm deployment

---

## 📝 Secrets Template

Copy and paste the structure below, then fill in your values:

```yaml
# secrets.env (DO NOT COMMIT - For reference only)

# Hostinger Git
HOSTINGER_GIT_HOST=hostinger.com
HOSTINGER_GIT_USER=u123456
HOSTINGER_GIT_REPO=:resonance.git
HOSTINGER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

# FTP
FTP_SERVER=ftp.resonancerehab.in
FTP_USERNAME=u123456
FTP_PASSWORD=password123

# Email
EMAIL_SERVER=mail.resonancerehab.in
EMAIL_PORT=465
EMAIL_USERNAME=noreply@resonancerehab.in
EMAIL_PASSWORD=emailpassword123
DEPLOYMENT_EMAIL=admin@resonancerehab.in
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Git deployment fails | Check SSH keys in hPanel and HOSTINGER_SSH_KEY secret |
| FTP deployment fails | Verify FTP credentials and directory permissions |
| No email notification | Check EMAIL_* secrets and spam folder |
| Build fails | Check pnpm-lock.yaml is committed and pnpm is installed |
| Deploy path wrong | Review HOSTINGER_GIT_REPO and verify directory structure |
| Workflow doesn't trigger | Ensure push is to `publish` branch, not `main` |

---

## 🎯 Next Steps

1. [ ] Add all GitHub secrets
2. [ ] Set up SSH keys in Hostinger
3. [ ] Verify FTP access
4. [ ] Configure email settings
5. [ ] Make a test commit to `publish` branch
6. [ ] Watch the Actions tab
7. [ ] Verify deployment and email notification
8. [ ] Test website at https://resonancerehab.in

---

**Once complete, every push to `publish` will automatically build and deploy! 🚀**
