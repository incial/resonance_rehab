# 🎯 INCIAL Team Email Configuration

This guide shows you how to set up team-wide email notifications for deployments.

---

## 📧 What is TEAM_EMAIL_LIST?

`TEAM_EMAIL_LIST` is a new GitHub secret that contains email addresses of all INCIAL team members. When deployment completes, **all team members receive a notification email**.

---

## ✏️ Adding TEAM_EMAIL_LIST Secret

### Option 1: Add as Single Email (Quick)

If you want all email to go to a team distribution list:

1. Go to: https://github.com/incial/resonance_rehab/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `TEAM_EMAIL_LIST`
4. Value: `team@incial.com` (or your distribution list)
5. Click **"Add secret"**

### Option 2: Add Multiple Team Members (Recommended)

To notify each team member individually:

1. Go to: https://github.com/incial/resonance_rehab/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `TEAM_EMAIL_LIST`
4. Value: 
```
member1@incial.com,member2@incial.com,member3@incial.com,admin@incial.com
```
5. Click **"Add secret"**

---

## 📋 INCIAL Team Member Emails Template

Ask your DevOps/Admin to provide emails in this format:

```
developer1@incial.com,developer2@incial.com,designer1@incial.com,project-manager@incial.com,devops@incial.com
```

---

## ✅ Verify Configuration

After adding the secret:

1. Go to: https://github.com/incial/resonance_rehab/settings/secrets/actions
2. Look for `TEAM_EMAIL_LIST` in the list
3. Should show: `• TEAM_EMAIL_LIST` (with a dot ✓)

---

## 🚀 Test Deployment Notification

Once configured, test by:

```bash
git checkout publish
echo "test" >> test.txt
git add test.txt
git commit -m "Test deployment notification"
git push origin publish
```

Then:
1. Go to GitHub Actions tab
2. Wait for workflow to complete (~2-3 minutes)
3. Check all team members' email inboxes
4. Should see notification from GitHub Actions

---

## 📧 What's in the Email?

Each team member receives:

```
Subject: 🚀 Resonance Rehab - Deployment ✅ Success by [Developer Name]

Contents:
- Deployment status (Success/Failed)
- Who deployed it
- What branch was deployed from (publish)
- Commit SHA and timestamp
- Commit message
- Live domain link
- Workflow logs link
```

---

## 🔄 If No Secret Provided

If `TEAM_EMAIL_LIST` is not set, the system falls back to `DEPLOYMENT_EMAIL` (single email).

To check what's configured:

```bash
gh secret list
```

Look for:
- `TEAM_EMAIL_LIST` - Primary (if set)
- `DEPLOYMENT_EMAIL` - Fallback (always set)

---

## 🔐 Security Notes

- The email list is stored as a GitHub secret (encrypted)
- Only visible to repository admins
- Never exposed in logs or public URLs
- Email addresses are NOT shown in workflow runs

---

## 🆘 Troubleshooting

### "Email not received"
- Check if email went to spam folder
- Verify email address is in the secret
- Check SMTP settings (EMAIL_SERVER, EMAIL_PORT secrets)
- Wait 5 minutes after deployment

### "Only one person received email"
- Make sure emails are comma-separated (no spaces)
- Check EMAIL_SERVER and EMAIL_PORT secrets

### "Can't find secrets settings"
- You must have admin access to the repository
- Go to: https://github.com/incial/resonance_rehab/settings/secrets/actions

---

## 📚 Related Documentation

- [TEAM_DEPLOYMENT_GUIDE.md](TEAM_DEPLOYMENT_GUIDE.md) - Full team deployment guide
- [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md) - Initial setup instructions
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference

---

## ✨ Next Steps

1. ✅ Add TEAM_EMAIL_LIST secret
2. ✅ Test deployment notification
3. ✅ Share TEAM_DEPLOYMENT_GUIDE.md with team
4. ✅ Share QUICK_REFERENCE.md with team
5. ✅ Ready for team to start deploying!

---

**Contact DevOps/Admin if you need help setting this up!**
