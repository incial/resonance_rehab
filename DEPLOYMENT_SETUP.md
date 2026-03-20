# GitHub Actions - Hostinger Deployment Automation

This document guides you through setting up the automated deployment workflow for Resonance Rehab to Hostinger.

## 📋 Overview

The workflow automatically builds and deploys your React app whenever you push to the `publish` branch. It uses:

- **Primary Method**: Git-based deployment (fast, direct)
- **Fallback Method**: FTP deployment (reliable backup)
- **Notifications**: GitHub comments + Email notifications

---

## 🔐 Required GitHub Secrets

Add these secrets to your repository: **Settings → Secrets and Variables → Actions**

### 1. Hostinger Git Deployment Secrets

#### `HOSTINGER_GIT_HOST`
- **What**: The Git server hostname
- **Where to find**: Log in to hPanel → Git Repositories → Your repo → Copy the SSH URL
- **Example**: `hostinger.com` or `git.hostinger.com`
- **How to get via MCP**:
  ```bash
  # Use Hostinger MCP to fetch your Git repository details
  hostinger-api-mcp --call hosting_getGitRepositoriesV1 --args '{"domain":"resonancerehab.in"}'
  ```

#### `HOSTINGER_GIT_USER`
- **What**: Git service username (usually your hosting username)
- **Where to find**: hPanel → Git Repositories → User/SSH info
- **Example**: `u123456`

#### `HOSTINGER_GIT_REPO`
- **What**: The full Git repository path
- **Format**: `:path/to/resonance.git` (include the colon for SSH)
- **Where to find**: hPanel → Git Repositories → Clone URL (SSH)
- **Example**: `:resonance.git` or `:repositories/resonance.git`

#### `HOSTINGER_SSH_KEY`
- **What**: Your private SSH key for Git authentication
- **How to generate**:
  ```bash
  ssh-keygen -t ed25519 -C "github-actions" -f hostinger_deploy -N ""
  ```
- **Then**:
  1. Save the private key content (from `hostinger_deploy`) to this secret
  2. Add the public key (from `hostinger_deploy.pub`) to hPanel → SSH Keys

---

### 2. FTP Fallback Secrets

If Git deployment fails, FTP will be used as a backup.

#### `FTP_SERVER`
- **Example**: `ftp.resonancerehab.in`

#### `FTP_USERNAME`
- **Example**: `u123456`

#### `FTP_PASSWORD`
- Your FTP account password

---

### 3. Email Notification Secrets

#### `EMAIL_SERVER`
- **Example**: `mail.resonancerehab.in` or `smtp.gmail.com`

#### `EMAIL_PORT`
- **Example**: `465` (secure) or `587` (TLS)

#### `EMAIL_USERNAME`
- Your email address for sending notifications

#### `EMAIL_PASSWORD`
- Your email password (or app-specific password)

#### `DEPLOYMENT_EMAIL`
- Where to send deployment notifications
- **Example**: `your-email@resonancerehab.in`

---

### 4. Hostinger API Secret (Optional - for MCP)

#### `HOSTINGER_API_TOKEN`
- Already in `.mcp.json` - not needed in GitHub secrets
- Only add here if you want MCP to manage configurations

---

## 🚀 Setting Up the Secrets

### Quick Setup via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

gh secret set HOSTINGER_GIT_HOST
# When prompted, enter your Git hostname

gh secret set HOSTINGER_GIT_USER
# Enter your hosting username

gh secret set HOSTINGER_GIT_REPO
# Enter your Git repo path (e.g., :resonance.git)

gh secret set HOSTINGER_SSH_KEY
# Paste your private SSH key content

gh secret set FTP_SERVER
gh secret set FTP_USERNAME
gh secret set FTP_PASSWORD

gh secret set EMAIL_SERVER
gh secret set EMAIL_PORT
gh secret set EMAIL_USERNAME
gh secret set EMAIL_PASSWORD
gh secret set DEPLOYMENT_EMAIL
```

### Via GitHub Web UI

1. Go to your repository
2. Click **Settings** → **Secrets and Variables** → **Actions**
3. Click **New repository secret**
4. Add each secret one by one

---

## 🔧 Getting Your Hostinger Git Repository Details Using MCP

Since you have the Hostinger MCP configured, you can use it to fetch your repository details:

```bash
# Make sure you have the MCP configured with your API token
export HOSTINGER_API_TOKEN="W1f3J8jI5a1SSjLcELJ1cMjd9ZHNNdaKXZmFElHyfa2bea25"

# List hosting orders
curl -X GET "https://api.hostinger.com/api/hosting/v1/orders" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"

# List websites for your domain
curl -X GET "https://api.hostinger.com/api/hosting/v1/websites?domain=resonancerehab.in" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"

# Get Git repository details (if available via API)
curl -X GET "https://api.hostinger.com/api/hosting/v1/git-repositories?domain=resonancerehab.in" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

Or in your VS Code/IDE with the Hostinger MCP connected, ask Claude:
> "Show me the Git repository details for resonancerehab.in using Hostinger API"

---

## 📦 SSH Key Setup in Hostinger

1. Generate SSH key (if not already done):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f hostinger_deploy -N ""
   ```

2. Log in to **hPanel**

3. Go to **Settings** → **SSH Keys** (or **Account** → **SSH Keys**)

4. Click **Add SSH Key**

5. Paste the content of `hostinger_deploy.pub` (the public key)

6. Save the repository SSH connection URL provided by Hostinger

---

## 🔄 Deployment Flow

```
┌─────────────────────────────────────┐
│ Push to 'publish' branch            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 1. Checkout & Install Dependencies  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Build React App (pnpm build)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Prepare Deployment Packages      │
│    - dist/ → react/                 │
│    - .htaccess → root/              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Try Git Deployment (Primary)     │
│    ├─ Clone Hostinger Git repo      │
│    ├─ Copy build files              │
│    └─ Commit & Push                 │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    ✅ Success    ❌ Fail
        │             │
        │      ┌──────▼──────┐
        │      │ 5. FTP Backup│
        │      │ - Upload     │
        │      └──────┬───────┘
        │             │
        └─────┬───────┘
              │
       ┌──────▼──────┐
       │6. Notifications
       ├─ GitHub Comment
       └─ Email Alert
```

---

## ✅ Testing the Workflow

### 1. Manual Trigger (without pushing)
```bash
gh workflow run deploy.yml --ref publish
```

### 2. Test Push to Publish Branch
```bash
git checkout publish
git commit --allow-empty -m "Test deployment"
git push origin publish
```

### 3. Monitor Workflow
- Go to your repository → **Actions** tab
- Click on the latest workflow run
- Watch the logs in real-time

---

## 📧 Deployment Notifications

You'll receive notifications via:

### GitHub Comments
- Comments on your PR/commits in the publish branch
- Shows deployment success/failure
- Includes build details and timestamp

### Email Notifications
- Sent to the address in `DEPLOYMENT_EMAIL`
- Includes commit message and deployment details
- Works regardless of GitHub issue/PR context

---

## 🐛 Troubleshooting

### Git Deployment Fails
- ✅ **Check**: Are all `HOSTINGER_GIT_*` secrets set correctly?
- ✅ **Check**: Is the SSH key added to hPanel?
- ✅ **Check**: Does the Git repository exist in your hosting?
- ✅ **Fallback**: FTP will automatically take over

### FTP Deployment Fails
- ✅ **Check**: Are FTP credentials correct?
- ✅ **Check**: Is FTP access enabled in hPanel?
- ✅ **Check**: Do the paths `/public_html/react/` exist?

### Email Notifications Not Received
- ✅ **Check**: Is `EMAIL_SERVER`, `EMAIL_USERNAME`, `EMAIL_PASSWORD` correct?
- ✅ **Check**: Is the `DEPLOYMENT_EMAIL` address correct?
- ✅ **Check**: Check email spam folder

### Workflow Errors
1. Go to **Actions** → Latest run
2. Click on **build-and-deploy**
3. Review the failed step logs
4. Look for error messages

---

## 🚀 Next Steps

1. ✅ Add all required secrets to GitHub
2. ✅ Test with a small change: `git push origin publish`
3. ✅ Monitor the workflow in the Actions tab
4. ✅ Verify deployment at https://resonancerehab.in
5. ✅ Check email notification was received

---

## 📚 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hostinger Git Deployment Docs](https://support.hostinger.com/en/articles/6385144-how-to-use-git-deployment)
- [Hostinger API Documentation](https://developers.hostinger.com/)
- [SSH Keys Setup](https://support.hostinger.com/en/articles/4749686-how-to-set-up-ssh-keys)

---

## 💡 Tips

- The `publish` branch is your production branch - keep it stable
- Each successful deployment sends you a notification with the URL and details
- You can manually trigger the workflow without pushing: Use GitHub CLI or Actions UI
- FTP acts as a reliable backup if Git deployment encounters issues
