# ⚡ Quick Reference - Deployment Commands

## 🚀 Standard Workflow (Copy & Paste)

```bash
# 1. Create new feature branch
git checkout -b feature/your-feature-name

# 2. Make changes, commit
git add .
git commit -m "Your meaningful commit message"

# 3. Push to your branch
git push origin feature/your-feature-name

# 4. Create PR on GitHub (or merge after approval)
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main

# 5. After code review is approved - DEPLOY
git checkout publish
git pull origin publish
git merge feature/your-feature-name
git push origin publish    ← DEPLOOYS LIVE! 🎉
```

---

## 📋 Quick Command Reference

| Command | Purpose |
|---------|---------|
| `git checkout -b feature/name` | Create new feature branch |
| `git status` | See what changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push origin branch` | Push to GitHub |
| `git pull origin branch` | Get latest changes |
| `git log --oneline` | See commit history |
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Run local dev server |
| `pnpm run build` | Build for production |

---

## ✅ Deployment Checklist

- [ ] Made changes on feature branch
- [ ] Tested locally with `pnpm run dev`
- [ ] Committed with meaningful message
- [ ] Pushed to GitHub
- [ ] Created and requested PR review
- [ ] Got approval from reviewer
- [ ] Merged to `main`
- [ ] Merged `main` to `publish`
- [ ] Pushed to `publish` ← **DEPLOYMENT TRIGGERS HERE**
- [ ] Check GitHub Actions tab
- [ ] Received email notification
- [ ] Verified live at https://resonancerehab.in

---

## 🆘 Quick Fixes

**Accidentally pushed to wrong branch?**
```bash
git push --force origin branch:correct-branch
git push origin --delete wrong-branch
```

**Need to undo last commit?**
```bash
git reset --soft HEAD~1
```

**Merge conflicts?**
```bash
git status  # See conflicts
# Edit conflicted files in your editor
git add .
git commit -m "Resolve merge conflicts"
```

**Out of sync with main?**
```bash
git fetch origin
git rebase origin/main
```

---

## 🎯 Deployment Branches

| Branch | Status | Deploy? |
|--------|--------|---------|
| `main` | Development | ❌ NO |
| `publish` | Production | ✅ YES - AUTO |
| `feature/*` | Work in progress | ❌ NO |

---

## 📊 Status Check

Check deployment status:
```
https://github.com/incial/resonance_rehab/actions
```

View live site:
```
https://resonancerehab.in
```

---

## 🚨 If Deployment Fails

1. Go to: https://github.com/incial/resonance_rehab/actions
2. Click failed workflow
3. Check logs for error
4. Common fixes:
   - Run `pnpm install` locally
   - Run `pnpm run build` to test build
   - Check for syntax errors
   - Verify no large files committed

---

**Pro Tip:** Pin this guide to your bookmark bar for quick reference!

**Questions?** Ask in #dev Slack channel
