# 🚀 Automated Deployment System for Resonance Rehab

**Resonance Rehab** now has a fully automated CI/CD pipeline that builds and deploys your React application to Hostinger whenever you push to the `publish` branch.

---

## 📖 Quick Start

### For First-Time Setup (5 minutes)

```bash
# 1. On your local machine, run the setup script
# On macOS/Linux:
bash setup-secrets.sh

# On Windows (PowerShell):
powershell -ExecutionPolicy Bypass -File setup-secrets.ps1

# 2. Follow the prompts to add all required secrets
# 3. The script will automatically add them to GitHub

# 4. Make a test commit to the publish branch
git checkout publish
git commit --allow-empty -m "Test deployment"
git push origin publish

# 5. Watch the deployment in GitHub Actions
# Go to: https://github.com/incial/resonance_rehab/actions
```

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   You push code                         │
│              (push to 'publish' branch)                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  1. GitHub Actions Triggered       │
        │  2. Install dependencies (pnpm)    │
        │  3. Build React app (pnpm build)   │
        │  4. Prepare deployment files       │
        └────────────┬─────────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │   Try Git Deployment          │
        │   (Primary Method)            │
        └────────────┬──────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
        ✅ SUCCESS        ❌ FAIL
            │                 │
            │        ┌────────▼────────┐
            │        │  Try FTP Deploy  │
            │        │  (Fallback)      │
            │        └────────┬────────┘
            │                 │
            │            ┌────┴─────┐
            │            │           │
            │        ✅ SUCCESS  ❌ FAIL
            │            │           │
            └────────┬───┘           │
                     │               │
        ┌────────────▼──────────────▼────┐
        │   Send Notifications:          │
        │   - GitHub comment             │
        │   - Email notification         │
        └────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  App now live at:              │
        │  https://resonancerehab.in     │
        └────────────────────────────────┘
```

---

## 📋 What's Included

### 1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- Automatically triggered on pushes to `publish` branch
- Builds your React app using pnpm
- Deploys via Git (primary) or FTP (fallback)
- Sends notifications on completion

### 2. **Hostinger MCP Integration** (`.mcp.json`)
- Your Hostinger API token is configured
- Allows Claude/Copilot to access Hostinger APIs
- Enables advanced deployment management

### 3. **Setup Scripts**
- **`setup-secrets.sh`** - For macOS/Linux
- **`setup-secrets.ps1`** - For Windows PowerShell
- Interactive guides to add all GitHub secrets

### 4. **Documentation**
- **`DEPLOYMENT_SETUP.md`** - Detailed setup instructions
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step verification
- This file - Overview and quick start

---

## 🔐 GitHub Secrets Required

The following secrets must be added to your GitHub repository for the deployment to work:

### Hostinger Git Deployment
- `HOSTINGER_GIT_HOST` - Your Git server hostname
- `HOSTINGER_GIT_USER` - Your hosting username
- `HOSTINGER_GIT_REPO` - Your Git repository path
- `HOSTINGER_SSH_KEY` - Your private SSH key

### FTP Fallback
- `FTP_SERVER` - FTP server address
- `FTP_USERNAME` - FTP username
- `FTP_PASSWORD` - FTP password

### Email Notifications
- `EMAIL_SERVER` - SMTP server address
- `EMAIL_PORT` - SMTP port (465 or 587)
- `EMAIL_USERNAME` - Sender email
- `EMAIL_PASSWORD` - Email password
- `DEPLOYMENT_EMAIL` - Recipient email

**👉 Use the setup script to add these automatically!**

---

## 🚀 Deployment Process

### Trigger
- Push to the `publish` branch
- Or manually trigger via GitHub Actions UI

### Build (~ 2-3 minutes)
```
1. ✓ Checkout code
2. ✓ Install Node.js and pnpm
3. ✓ Cache dependencies
4. ✓ Install project dependencies
5. ✓ Build React app (pnpm build)
6. ✓ Prepare deployment archives
```

### Deploy (Primary - Git)
```
1. ✓ Setup SSH authentication
2. ✓ Clone Hostinger Git repository
3. ✓ Copy dist/ files to react/ subdirectory
4. ✓ Copy .htaccess to root
5. ✓ Commit changes
6. ✓ Push to Hostinger Git repository
```

### Deploy (Fallback - FTP)
*Only if Git deployment fails:*
```
1. ✓ Upload dist/ files to /public_html/react/
2. ✓ Upload .htaccess to /public_html/
```

### Notify
```
1. ✓ Post GitHub comment (success/failure)
2. ✓ Send email notification
```

---

## 📧 Notifications

### GitHub Comments
- Posted to your commit/PR
- Shows deployment status
- Includes domain, path, and timestamp

### Email Notifications
- Sent to your configured email
- Includes commit message and deployment details
- Works regardless of GitHub context

Example email:
```
Subject: 🔔 Resonance Rehab - Deployment ✅ Success

Deployment Status: success
Repository: incial/resonance_rehab
Branch: publish
Commit: abc1234

Domain: https://resonancerehab.in
Deployment Path: /public_html/react/

Build Time: https://github.com/incial/resonance_rehab/actions/runs/12345

Timestamp: 2026-03-20 15:30:45 UTC
```

---

## 🛠️ Configuration Files

### `.github/workflows/deploy.yml`
Main workflow file. Orchestrates the entire build and deployment process.

**Triggers:**
- `push` to `publish` branch
- `workflow_dispatch` (manual trigger via GitHub UI)

**Environment:**
- Node.js 20
- pnpm package manager
- Ubuntu runner

**Steps:**
1. Checkout code
2. Setup Node.js and pnpm
3. Install dependencies
4. Build React app
5. Prepare deployment packages
6. Deploy via Git (primary)
7. Deploy via FTP (fallback)
8. Send notifications
9. Cleanup

### `.mcp.json`
Hostinger MCP configuration with your API token.
- **Added to `.gitignore`** for security
- Allows Claude/Copilot to use Hostinger APIs
- Not used by the workflow itself

---

## 📁 Deployment Structure

Your files will be deployed to:

```
resonancerehab.in
├── /public_html/
│   ├── .htaccess (root config)
│   └── /react/
│       ├── index.html
│       ├── assets/
│       ├── favicon.ico
│       └── ...other built files
└── ...
```

---

## ✅ Verification

After setting everything up:

1. **Verify Secrets**
   ```bash
   gh secret list
   ```
   Should show all 12 secrets

2. **Test Deployment**
   ```bash
   git checkout publish
   git commit --allow-empty -m "Test"
   git push origin publish
   ```

3. **Monitor Workflow**
   - Go to: https://github.com/incial/resonance_rehab/actions
   - Click on the latest workflow run
   - Watch logs in real-time

4. **Check Live Site**
   - Visit: https://resonancerehab.in
   - Verify your latest changes are visible

5. **Check Notification Email**
   - Look in inbox and spam folder
   - Deployment status should be included

---

## 🆘 Troubleshooting

### Workflow Not Triggering
- ✅ Are you pushing to `publish` branch (not `main`)?
- ✅ Is `.github/workflows/deploy.yml` committed?
- ✅ Check Actions tab for any errors

### Deployment Fails
- ✅ Check the failed step in Actions logs
- ✅ Verify all secrets are correctly set: `gh secret list`
- ✅ Ensure FTP credentials work (fallback method)

### No Notifications
- ✅ Check email address in `DEPLOYMENT_EMAIL`
- ✅ Check spam folder
- ✅ Verify email secrets are correct

### SSH Connection Issues
- ✅ Verify SSH key is added to hPanel
- ✅ Check `HOSTINGER_SSH_KEY` secret
- ✅ Ensure SSH key path format is correct

### FTP Deployment Issues
- ✅ Test FTP credentials with FileZilla
- ✅ Verify directories exist: `/public_html/react/`
- ✅ Check FTP permissions

---

## 🔄 Workflow

### Daily Development
1. Work on your code locally
2. Push to feature branches normally
3. When ready: `git merge origin/main && git push`
4. Create PR for review
5. After approval, merge to `publish` branch

### Push to Production
```bash
# Get latest changes
git checkout publish
git pull origin publish

# Make your final commits or merge PR
git merge your-feature-branch

# Push to deploy
git push origin publish

# GitHub Actions handles the rest!
```

### Manual Trigger (No Push Needed)
```bash
# Trigger via GitHub CLI
gh workflow run deploy.yml --ref publish

# Or use GitHub UI:
# Actions → Build and Deploy to Hostinger → Run workflow
```

---

## 📊 Status Monitoring

### GitHub Actions
- URL: https://github.com/incial/resonance_rehab/actions
- Shows all workflow runs
- Displays logs for each step
- Shows deployment history

### Email
- Check your configured email for notifications
- Every deployment sends status

### Live Site
- Verify changes at https://resonancerehab.in

---

## 🔐 Security Best Practices

1. **Secrets Management**
   - Never commit `.mcp.json` ✓ (added to .gitignore)
   - Never share SSH keys
   - Rotate email passwords periodically
   - Review secrets: `gh secret list`

2. **Branch Protection**
   - Consider protecting `publish` branch
   - Require reviews before merge
   - Run status checks

3. **Monitoring**
   - Get email notifications for all deployments
   - Review Actions logs
   - Monitor site performance after deployment

---

## 📞 Support Resources

### Documentation
- [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) - Detailed setup guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Verification steps
- [HOSTINGER_MCP.md](./HOSTINGER_MCP.md) - MCP configuration

### External Resources
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Hostinger Git Deployment](https://support.hostinger.com/en/articles/6385144)
- [Hostinger API Docs](https://developers.hostinger.com/)
- [GitHub CLI Docs](https://cli.github.com/manual)

### Quick Commands
```bash
# View recent deployments
gh run list --workflow deploy.yml --limit 10

# Check secret status
gh secret list

# Manually trigger deployment
gh workflow run deploy.yml --ref publish

# View specific workflow run
gh run view <run-id> --log
```

---

## 🎯 Next Steps

1. **Run Setup Script** (5 mins)
   ```bash
   # Windows PowerShell
   powershell -ExecutionPolicy Bypass -File setup-secrets.ps1
   ```

2. **Verify Secrets** (1 min)
   ```bash
   gh secret list
   ```

3. **Test Deployment** (3 mins)
   ```bash
   git checkout publish
   git push origin publish
   ```

4. **Monitor & Verify** (2 mins)
   - Check Actions: https://github.com/incial/resonance_rehab/actions
   - Check Email for notification
   - Visit: https://resonancerehab.in

5. **Start Using It** (ongoing)
   - Make changes locally
   - Push to `publish` when ready
   - Automatic deployment happens!

---

## ✨ Summary

✅ **Automated Build** - Runs pnpm build automatically  
✅ **Smart Deployment** - Git primary + FTP fallback  
✅ **Notifications** - GitHub comments + Email  
✅ **Version Control** - All changes tracked  
✅ **Rollback Ready** - Revert with `git revert`  

**Your deployment system is now production-ready! 🚀**
