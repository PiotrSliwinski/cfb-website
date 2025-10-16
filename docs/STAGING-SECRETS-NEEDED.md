# Staging Environment - Missing Secrets

**Date**: 2025-10-16
**Status**: 🔴 Deployment Blocked - Missing Required Secrets

---

## Current Status

Your staging deployment pipeline is **working correctly** but blocked because of missing Supabase secrets.

### What's Working ✅
- Lint & Type Check passed
- Build Application (Staging) passed
- Route Tests passed (4m24s)
- **Automated migration job triggered** (new feature working!)

### What Failed ❌
```
Apply Migrations (Staging) - Failed in 6s
Error: Cannot find project ref. Have you run supabase link?
```

**Root Cause**: `SUPABASE_URL` is empty/missing from Staging environment

---

## Current Secrets Status

### GitHub Staging Environment
✅ `SUPABASE_ANON_KEY` - Present
✅ `SUPABASE_SERVICE_ROLE_KEY` - Present
❌ `SUPABASE_URL` - **MISSING** (Critical!)
❌ `SUPABASE_DB_PASSWORD` - **MISSING** (Required for migrations)

### Repository Secrets (Global)
✅ `GCP_SA_KEY` - Present
✅ `GOOGLE_PLACES_API_KEY` - Present
✅ `GOOGLE_PROJECT_ID` - Present

---

## Required Actions

You need to add **2 missing secrets** to your **Staging environment**:

### 1. SUPABASE_URL (Critical - Blocks Everything)

**Where to find it:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **staging project**
3. Go to **Settings → API**
4. Copy **Project URL**

**Example format:**
```
https://abcdefghijklmnop.supabase.co
```

**How to add:**
```bash
# Option 1: Via GitHub CLI
gh secret set SUPABASE_URL --env Staging --body "https://YOUR-PROJECT-REF.supabase.co"

# Option 2: Via GitHub UI
# Go to: Settings → Environments → Staging → Add secret
# Name: SUPABASE_URL
# Value: https://YOUR-PROJECT-REF.supabase.co
```

### 2. SUPABASE_DB_PASSWORD (Required for Migrations)

**Where to find it:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **staging project**
3. Go to **Settings → Database**
4. Look for **Database password** (you set this when creating the project)

**If you forgot the password:**
1. Click **Reset database password**
2. Set a new password
3. Save it securely

**How to add:**
```bash
# Option 1: Via GitHub CLI
gh secret set SUPABASE_DB_PASSWORD --env Staging --body "your-database-password"

# Option 2: Via GitHub UI
# Go to: Settings → Environments → Staging → Add secret
# Name: SUPABASE_DB_PASSWORD
# Value: your-database-password
```

---

## Quick Fix Commands

If you have your Supabase staging credentials ready:

```bash
# Add SUPABASE_URL
gh secret set SUPABASE_URL \
  --env Staging \
  --body "https://YOUR-PROJECT-REF.supabase.co"

# Add SUPABASE_DB_PASSWORD
gh secret set SUPABASE_DB_PASSWORD \
  --env Staging \
  --body "your-database-password"

# Trigger a new deployment
git commit --allow-empty -m "Test staging deployment with Supabase secrets"
git push origin develop
```

---

## What Happens After Adding Secrets

Once you add both secrets and push to `develop` again:

1. ✅ Lint & Type Check (passes)
2. ✅ Build Application (Staging) (passes)
3. ✅ Route Tests (passes)
4. 🆕 **Apply Migrations (Staging)** - Will apply all 30 migrations automatically
5. ✅ Build Docker Image (Staging) - Only runs if migrations succeed
6. ✅ Deploy to Cloud Run (Staging) - Only runs if build succeeds

Your **30 existing migrations** will be automatically applied:
- Initial schema setup
- Seed data (treatments, team members)
- Storage configuration
- CMS foundation
- Settings system
- Languages system
- Insurance and payment methods
- Social media links

---

## Verification Steps

After adding secrets and pushing:

1. **Watch GitHub Actions**
   ```bash
   gh run watch --branch develop
   ```

2. **Check migration was applied**
   - Go to Supabase Dashboard → Your staging project
   - Click **SQL Editor**
   - Run:
     ```sql
     SELECT * FROM supabase_migrations.schema_migrations
     ORDER BY version DESC;
     ```
   - You should see all 30 migrations listed

3. **Verify deployment**
   ```bash
   # Check if staging service is running
   gcloud run services describe cfb-website-staging \
     --region europe-west1 \
     --format="value(status.url)"
   ```

---

## Troubleshooting

### If migration still fails after adding secrets:

**Check project reference is correct:**
```bash
# Your SUPABASE_URL should match this pattern:
# https://[PROJECT-REF].supabase.co
# Where PROJECT-REF is a 20-character alphanumeric string
```

**Check database password is correct:**
- The password is the one you set when creating the Supabase project
- NOT the service role key
- NOT the anon key
- It's the direct PostgreSQL database password

**View detailed logs:**
```bash
gh run view --branch develop --log-failed
```

---

## Why This Architecture?

### GitHub Environments Benefits
1. **Clean secret names** - Same names across staging/production
2. **Environment protection** - Can require approvals
3. **Clear organization** - Secrets grouped by environment
4. **Easy management** - Add/update secrets per environment

### Automated Migrations Benefits
1. **Zero manual work** - Migrations apply automatically
2. **Safety first** - Deployment blocked if migrations fail
3. **Full audit trail** - See exactly what ran in GitHub Actions
4. **Consistent** - Same process for staging and production

---

## Documentation References

📖 **Related Guides:**
- [Automated Database Migrations](./AUTOMATED-DATABASE-MIGRATIONS.md) - Complete migration system guide
- [GitHub Environments Setup](./GITHUB-ENVIRONMENTS-SETUP.md) - Environment configuration
- [Staging Database Setup](./STAGING-DATABASE-SETUP.md) - Initial database setup
- [Automated Migrations Ready](./AUTOMATED-MIGRATIONS-READY.md) - Quick start guide

---

## Summary

**You're almost there!** The automated migration system is working perfectly. Just add these 2 secrets:

1. ❌ `SUPABASE_URL` → Add to Staging environment
2. ❌ `SUPABASE_DB_PASSWORD` → Add to Staging environment

Then push to `develop` to trigger automatic migration and deployment!

---

**Last Updated**: 2025-10-16
**Next Step**: Add missing secrets to Staging environment
