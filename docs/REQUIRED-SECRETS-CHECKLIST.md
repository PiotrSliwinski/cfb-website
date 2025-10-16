# Required Secrets - Complete Checklist

**Date**: 2025-10-16
**Status**: 📋 2 Secrets Needed for Automated Migrations

---

## 🎯 What You Need to Add

To enable fully automated deployments with database migrations, you need to add **2 secrets** to your GitHub Staging Environment:

### 1. SUPABASE_DB_PASSWORD ⚠️ Required
**What**: PostgreSQL database password
**Where**: GitHub → Settings → Environments → Staging → Add secret
**Value**: Your database password (set when you created the Supabase project)

**How to find**:
```
1. Go to https://supabase.com/dashboard
2. Select your staging project: hkrpefnergidmviuewkt
3. Click Settings → Database
4. Find "Database password"
```

**How to add**:
```bash
gh secret set SUPABASE_DB_PASSWORD \
  --env Staging \
  --body "your-database-password"
```

### 2. SUPABASE_ACCESS_TOKEN ⚠️ Required
**What**: Personal Access Token for Supabase Management API
**Where**: GitHub → Settings → Environments → Staging → Add secret
**Value**: Personal access token from Supabase

**How to create**:
```
1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a name: "GitHub Actions - Staging"
4. Copy the token (you won't see it again!)
```

**How to add**:
```bash
gh secret set SUPABASE_ACCESS_TOKEN \
  --env Staging \
  --body "sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 📊 Complete Secrets Status

### GitHub Staging Environment

| Secret/Variable | Type | Status | Purpose |
|----------------|------|--------|---------|
| `SUPABASE_URL` | Variable | ✅ Present | Supabase project URL |
| `SUPABASE_ANON_KEY` | Secret | ✅ Present | Public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | ✅ Present | Server-side API key |
| **`SUPABASE_DB_PASSWORD`** | **Secret** | **❌ Missing** | **Database password for migrations** |
| **`SUPABASE_ACCESS_TOKEN`** | **Secret** | **❌ Missing** | **CLI authentication token** |

### Repository Secrets (Global)

| Secret | Status | Purpose |
|--------|--------|---------|
| `GCP_SA_KEY` | ✅ Present | Google Cloud authentication |
| `GOOGLE_PLACES_API_KEY` | ✅ Present | Google Places API |
| `GOOGLE_PLACE_ID` | ✅ Present | Your business place ID |
| `GOOGLE_PROJECT_ID` | ✅ Present | GCP project ID |

---

## 🔍 What Each Secret Does

### SUPABASE_DB_PASSWORD
```yaml
Purpose: Direct PostgreSQL database connection
Used by: supabase link --password
When: During migration jobs
Why: Links CLI to your database for schema changes
Example: "MySecurePassword123!"
```

### SUPABASE_ACCESS_TOKEN
```yaml
Purpose: Authenticate with Supabase Management API
Used by: supabase link, supabase db push
When: During all migration operations
Why: Verifies you have permission to modify the project
Example: "sbp_abc123def456..."
Format: Starts with "sbp_"
```

---

## 🚀 Quick Setup Commands

### Complete Setup (Both Secrets)
```bash
# 1. Set database password
gh secret set SUPABASE_DB_PASSWORD \
  --env Staging \
  --body "your-database-password-here"

# 2. Set access token
gh secret set SUPABASE_ACCESS_TOKEN \
  --env Staging \
  --body "sbp_your-token-here"

# 3. Verify secrets are set
gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/environments/Staging/secrets | jq -r '.secrets[].name'

# 4. Trigger deployment
git commit --allow-empty -m "test: Trigger deployment with migration secrets"
git push origin develop
```

---

## 📝 Step-by-Step Guide

### Step 1: Get Supabase Database Password
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **staging project** (hkrpefnergidmviuewkt)
3. Go to **Settings** (gear icon) → **Database**
4. Look for **Database password** section
5. If you forgot it, click **Reset database password**
6. Copy the password and save it securely

### Step 2: Get Supabase Access Token
1. Go to [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens)
2. Click **Generate new token**
3. Enter token name: `GitHub Actions - Staging`
4. Select scope: **Read/Write** (default)
5. Click **Generate token**
6. **Copy the token immediately** (won't be shown again!)
7. Save it securely

### Step 3: Add Secrets to GitHub

**Option A: Via GitHub CLI** (Recommended)
```bash
# In your project directory
cd /Users/piotr/Source\ Code/Github/cfb-website

# Add database password
gh secret set SUPABASE_DB_PASSWORD \
  --env Staging \
  --body "paste-your-password-here"

# Add access token
gh secret set SUPABASE_ACCESS_TOKEN \
  --env Staging \
  --body "paste-your-token-here"
```

**Option B: Via GitHub UI**
1. Go to your repository on GitHub
2. Click **Settings** → **Environments** → **Staging**
3. Under "Environment secrets", click **Add secret**
4. Add `SUPABASE_DB_PASSWORD`:
   - Name: `SUPABASE_DB_PASSWORD`
   - Value: Your database password
   - Click **Add secret**
5. Click **Add secret** again for the token
6. Add `SUPABASE_ACCESS_TOKEN`:
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: Your access token (starts with `sbp_`)
   - Click **Add secret**

### Step 4: Verify Secrets
```bash
# List secrets in Staging environment
gh api repos/PiotrSliwinski/cfb-website/environments/Staging/secrets \
  | jq -r '.secrets[].name'

# Expected output:
# SUPABASE_ANON_KEY
# SUPABASE_DB_PASSWORD     ← Should be here now
# SUPABASE_SERVICE_ROLE_KEY
# SUPABASE_ACCESS_TOKEN    ← Should be here now
# SUPABASE_URL (might be a variable)
```

### Step 5: Test Deployment
```bash
# Trigger a new deployment
git commit --allow-empty -m "test: Trigger staging deployment with complete secrets"
git push origin develop

# Watch the workflow
gh run watch $(gh run list --branch develop --limit 1 --json databaseId --jq '.[0].databaseId')
```

---

## ✅ What Happens After Adding Secrets

### Successful Workflow
```
✅ Lint & Type Check (35s)
✅ Build Application (1m6s)
✅ Route Tests (4m24s)
✅ Build Docker Image (2m15s)
✅ Apply Migrations (15s) ← Will succeed now!
   - Links to Supabase project ✅
   - Applies all 30 migrations ✅
   - Verifies migration status ✅
✅ Deploy to Cloud Run (45s)
✅ Smoke Tests (10s)

Total: ~9 minutes
Your staging site is live! 🎉
```

### Verification Steps
1. **Check GitHub Actions**
   ```bash
   gh run view --branch develop
   ```
   - All steps should be green ✅

2. **Check Supabase Database**
   - Go to Supabase Dashboard → Your staging project
   - Click **SQL Editor**
   - Run:
     ```sql
     SELECT COUNT(*) FROM supabase_migrations.schema_migrations;
     ```
   - Should return: **30** (all migrations applied)

3. **Check Staging Site**
   ```bash
   curl https://cfb-website-staging-clinica-ferreira-borges.run.app
   ```
   - Should return HTML (site is live)

---

## 🔒 Security Notes

### Database Password
- **Never commit** to git
- **Never log** in plain text
- **Rotate regularly** (every 90 days recommended)
- **Use strong password** (mix of letters, numbers, symbols)
- **Store securely** (password manager recommended)

### Access Token
- **Never share** publicly
- **Never commit** to git
- **Regenerate** if compromised
- **Use separate tokens** for staging and production
- **Review token usage** regularly in Supabase dashboard

### GitHub Secrets
- ✅ Encrypted at rest
- ✅ Only exposed during workflow execution
- ✅ Not visible in logs (masked automatically)
- ✅ Scoped to environment (Staging vs Production)
- ✅ Can be rotated without changing code

---

## 🆘 Troubleshooting

### "Access token not provided" Error
```
Error: Access token not provided
```
**Solution**: Add `SUPABASE_ACCESS_TOKEN` secret to GitHub Staging environment

### "Authentication failed" Error
```
Error: Failed to link project: authentication failed
```
**Possible causes**:
1. Wrong database password → Reset in Supabase Dashboard
2. Expired access token → Generate new token
3. Token doesn't have permissions → Regenerate with correct scope

### "Project not found" Error
```
Error: Project 'xxxxx' not found
```
**Possible causes**:
1. Wrong `SUPABASE_URL` → Verify in Supabase Dashboard
2. Access token for different account → Use token from correct account

### "Migration failed" Error
```
Error: Failed to apply migration
```
**Steps to debug**:
1. Check GitHub Actions logs for detailed error
2. Test migration locally: `npx supabase db reset`
3. Check migration SQL syntax
4. Verify migration is idempotent

---

## 📚 Reference Documentation

### Supabase CLI
- [CLI Reference](https://supabase.com/docs/reference/cli)
- [Link Command](https://supabase.com/docs/reference/cli/supabase-link)
- [DB Push Command](https://supabase.com/docs/reference/cli/supabase-db-push)

### GitHub Actions
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environment Secrets](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

### Related Docs
- [CI-CD-WORKFLOW-ORDER.md](./CI-CD-WORKFLOW-ORDER.md) - Workflow architecture
- [AUTOMATED-DATABASE-MIGRATIONS.md](./AUTOMATED-DATABASE-MIGRATIONS.md) - Migration guide
- [STAGING-DATABASE-SETUP.md](./STAGING-DATABASE-SETUP.md) - Initial setup

---

## ✨ Summary

**Required Actions**:
1. ❌ Add `SUPABASE_DB_PASSWORD` to Staging environment
2. ❌ Add `SUPABASE_ACCESS_TOKEN` to Staging environment

**Time Required**: ~5 minutes
**Result**: Fully automated staging deployments with migrations

**Commands**:
```bash
# Get database password from Supabase Dashboard
# Generate access token from Supabase Account page

# Add both secrets
gh secret set SUPABASE_DB_PASSWORD --env Staging --body "your-password"
gh secret set SUPABASE_ACCESS_TOKEN --env Staging --body "sbp_your-token"

# Test it
git commit --allow-empty -m "test: Complete staging setup"
git push origin develop
```

---

**Last Updated**: 2025-10-16 13:45 WEST
**Status**: Waiting for 2 secrets
**Next Step**: Add secrets and test deployment
