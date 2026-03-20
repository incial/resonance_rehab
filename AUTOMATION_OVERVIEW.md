# 🚀 INCIAL Team - Complete Automation Setup

Welcome! This document summarizes the complete deployment automation for **Resonance Rehab** and guides INCIAL team members through using it.

---

## 🎯 What is This?

**Automated deployment system** that:
- ✅ Automatically deploys code to production when you push to `publish` branch
- ✅ Notifies all team members on every deployment
- ✅ Handles build, test, and deploy automatically
- ✅ Provides fallback deployment methods (Git + FTP)
- ✅ Ensures production always has latest stable code

---

## 📚 Documentation Structure

### For Team Members:
1. **[TEAM_DEPLOYMENT_GUIDE.md](TEAM_DEPLOYMENT_GUIDE.md)** ← **START HERE**
   - Complete workflow explanation
   - Step-by-step instructions
   - Branch strategy
   - Troubleshooting guide

2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
   - Command quick reference
   - Copy-paste workflows
   - Deployment checklist

3. **[TEAM_EMAIL_SETUP.md](TEAM_EMAIL_SETUP.md)**
   - Configure team notifications
   - Multi-member email list
   - Verification guide

### For DevOps/Admins:
1. **[README_DEPLOYMENT.md](README_DEPLOYMENT.md)**
   - Complete technical overview
   - Architecture explanation
   - All deployment methods

2. **[DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md)**
   - Detailed secret configuration
   - API tokens, SSH keys, FTP credentials
   - Email SMTP setup

3. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
   - Verification checklist
   - Troubleshooting table
   - Testing procedures

---

## ⚡ 30-Second Overview

```
Every Team Member:
1. Create feature branch
2. Make changes locally
3. Push to GitHub
4. Create Pull Request
5. Get code review approval
6. Merge to 'publish' branch
7. Push to 'publish'
8. 🎉 AUTOMATIC DEPLOYMENT! 🎉
9. Receive email notification
10. Check live site: resonancerehab.in
```

---

## 🌳 Git Branch Strategy

```
┌─────────────────────────────────────────────────────┐
│         INCIAL REPOSITORY BRANCHES                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  main                                               │
│  ↓                                                   │
│  Development branch                                 │
│  (All features merged here after PR review)         │
│                                                     │
│  ↓ (After testing & validation)                     │
│                                                     │
│  publish                                            │
│  ↓                                                   │
│  🚀 AUTO-DEPLOYS TO PRODUCTION 🚀                  │
│  (resonancerehab.in)                               │
│                                                     │
│  feature/*, fix/*, refactor/* branches             │
│  (Individual developer work - no deploy)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow Explained

### Stage 1: Development
```bash
git checkout -b feature/add-homepage
# Make changes...
git commit -m "Add new homepage features"
git push origin feature/add-homepage
```
→ **No deployment** (just your feature branch)

### Stage 2: Code Review
- Create Pull Request on GitHub
- Team reviews your code
- Leave PR open for feedback

### Stage 3: Merge to Main
After approval:
```bash
git checkout main
git pull origin main
git merge feature/add-homepage
git push origin main
```
→ **Still no deployment** (just merged to main)

### Stage 4: Deploy to Production
When ready to go live:
```bash
git checkout publish
git pull origin publish
git merge main
git push origin publish  ← 🚀 DEPLOYMENT BEGINS HERE!
```

### Stage 5: Automated Deployment
```
GitHub Actions:
1. Checks out code
2. Installs dependencies
3. Builds production version
4. Tests build
5. Deploys to Hostinger (Git method)
6. Fallback to FTP if needed
7. Sends email to team
↓
https://resonancerehab.in (Updated!)
Email notification received
```

→ **PRODUCTION LIVE!** 🎉

---

## 👥 Who Should Do What?

### All Team Members:
- Create feature branches
- Make commits
- Create Pull Requests
- Request code reviews
- Get approval from peers
- Merge to main after approval
- Coordinate with team when pushing to publish

### Project Lead:
- Review pull requests
- Approve code changes
- Manage merge to publish branch
- Monitor deployments
- Handle deployment failures

### DevOps/Admin:
- Initial setup of secrets
- SSH key management
- FTP credential management
- SMTP email configuration
- Troubleshoot deployment issues

---

## 📊 Deployment Status & Monitoring

### Real-time Status
**GitHub Actions Dashboard:** https://github.com/incial/resonance_rehab/actions
- See workflow progress
- Check logs if failed
- View deployment history

### Email Notifications
- All team members notified when deployment completes
- Email includes: status, who deployed, what changed
- Sent to `TEAM_EMAIL_LIST` (all members)

### Live Verification
- **Staging/Live:** https://resonancerehab.in
- Test key features
- Verify everything works post-deployment

---

## ✋ Required Setup (Admin Only)

Before team can start deploying, admin must:

1. ✅ Set up GitHub Secrets (12 total)
   - Hostinger Git credentials
   - FTP credentials
   - Email configuration
   - SSH keys

2. ✅ Add TEAM_EMAIL_LIST secret
   - Contains all team member emails
   - Used for notifications

3. ✅ Share documentation with team
   - TEAM_DEPLOYMENT_GUIDE.md
   - QUICK_REFERENCE.md
   - This file

---

## 🚨 Common Issues & Solutions

### "Deployment failed"
→ Check GitHub Actions logs: https://github.com/incial/resonance_rehab/actions

### "I didn't get an email"
→ Check if TEAM_EMAIL_LIST is configured correctly
→ See: TEAM_EMAIL_SETUP.md

### "Merge conflict when merging to publish"
→ Resolve conflicts locally
```bash
git checkout publish
git pull origin publish
git merge main  # Fix conflicts here
git add .
git commit -m "Resolve merge conflicts"
git push origin publish
```

### "Need to revert deployment"
→ Revert the commit that caused issues
```bash
git checkout publish
git revert [commit-sha]
git push origin publish
```

---

## 🔐 Security Best Practices

✅ **Always:**
- Create feature branches (never push directly to main/publish)
- Get peer review before merging
- Test locally before committing
- Use meaningful commit messages

❌ **Never:**
- Push secrets or credentials
- Force push to main or publish
- Skip code review for "quick fixes"
- Test with real user data in commits

---

## 📞 Getting Help

| Issue | Solution |
|-------|----------|
| How do I make changes? | See TEAM_DEPLOYMENT_GUIDE.md |
| Need quick command reference? | See QUICK_REFERENCE.md |
| How do I set up notifications? | See TEAM_EMAIL_SETUP.md |
| Deployment failed - what to do? | Check GitHub Actions logs |
| Questions about the system? | Ask DevOps team in Slack |

---

## ✨ Key Points to Remember

1. **Push to `publish` = Deploy to Production**
   - Be careful!
   - Only push when ready
   - Coordinate with team

2. **Team gets email on every deployment**
   - Includes who deployed it
   - Includes what changed
   - Includes link to live site

3. **Everything is automatic after push**
   - Build happens automatically
   - Tests run automatically
   - Deployment happens automatically
   - No manual steps needed

4. **Always use feature branches**
   - Never push directly to main/publish
   - Create PR for code review
   - Merge after approval

---

## 🎓 First Deployment Checklist

For your first deployment as an INCIAL team member:

- [ ] Clone main repository: `git clone https://github.com/incial/resonance_rehab`
- [ ] Read TEAM_DEPLOYMENT_GUIDE.md
- [ ] Make a small test change
- [ ] Create feature branch: `git checkout -b test/first-deploy`
- [ ] Commit change: `git commit -m "Test deployment"`
- [ ] Push: `git push origin test/first-deploy`
- [ ] Create Pull Request on GitHub
- [ ] Get approval from another team member
- [ ] Merge to main: `git checkout main && git merge test/first-deploy`
- [ ] Merge to publish: `git checkout publish && git merge main`
- [ ] Push to publish: `git push origin publish`
- [ ] Check GitHub Actions until complete
- [ ] Receive email notification
- [ ] Verify live at resonancerehab.in
- [ ] 🎉 First deployment complete!

---

## 📚 Full Documentation Index

| Document | Purpose | For Whom |
|----------|---------|----------|
| [TEAM_DEPLOYMENT_GUIDE.md](TEAM_DEPLOYMENT_GUIDE.md) | Complete team guide | All team members |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Command reference | All team members |
| [TEAM_EMAIL_SETUP.md](TEAM_EMAIL_SETUP.md) | Email notification setup | Admin/Project Lead |
| [README_DEPLOYMENT.md](README_DEPLOYMENT.md) | Technical overview | DevOps/Admin |
| [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md) | Detailed secret setup | DevOps/Admin |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Verification checklist | DevOps/Admin |

---

## 🎯 Next Steps

### If You're a Team Member:
1. Read TEAM_DEPLOYMENT_GUIDE.md
2. Bookmark QUICK_REFERENCE.md
3. Set up local development environment
4. Make your first change
5. Follow deployment workflow

### If You're an Admin:
1. Verify all 12 GitHub secrets are set
2. Add TEAM_EMAIL_LIST secret
3. Share this guide with team
4. Share TEAM_DEPLOYMENT_GUIDE.md with team
5. Test deployment with small change

---

## 🌟 Benefits of This Automation

✨ **For Developers:**
- No manual deployment steps
- Automatic testing before deployment
- Fast feedback on failures
- Email notifications on status

✨ **For Team:**
- Consistent deployments
- Reduced human error
- Complete deployment history
- Everyone knows what's deployed

✨ **For Organization:**
- Fast release cycle
- Automated quality checks
- Reliable production updates
- Transparent deployment tracking

---

**Welcome to the INCIAL deployment automation! 🚀**

*For questions, check the documentation above or contact your DevOps team.*

**Last Updated:** March 2026
