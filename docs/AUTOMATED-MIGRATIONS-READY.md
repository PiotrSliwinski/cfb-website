# Automated Database Migrations - Ready to Use

**Date**: 2025-10-16
**Status**: ✅ Implementation Complete - Awaiting Final Secret

---

## What's Been Done

Your CI/CD pipeline now **automatically applies database migrations** before every deployment!

### New Migration Jobs

**Job 6: Apply Migrations (Staging)**
- Triggers on `develop` branch push
- Uses Supabase CLI to apply migrations
- Runs before Docker build
- Deployment blocked if migrations fail

**Job 7: Apply Migrations (Production)**
- Triggers on `main` branch push
- Uses Supabase CLI to apply migrations
- Runs before Docker build
- Deployment blocked if migrations fail

### How It Works

```
Push to develop/main
    ↓
Lint & Type Check
    ↓
Build Application
    ↓
Route Tests
    ↓
Apply Database Migrations ← NEW! Automatic
    ↓
Build Docker Image (only if migrations succeed)
    ↓
Deploy to Cloud Run
    ↓
Smoke Tests
```

---

## Required Secret (Last Step)

You need to add **one more secret** to both GitHub Environments:

### SUPABASE_DB_PASSWORD

This is your **PostgreSQL database password** (not the service role key).

**Where to Add:**
1. Go to **Settings → Environments → Staging**
2. Click **Add secret**
3. Name: `SUPABASE_DB_PASSWORD`
4. Value: Your database password
5. Repeat for **Production** environment

**Where to Find the Password:**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Settings → Database**
- Look for "Database password" (you set this when creating the project)

**If you forgot the password:**
1. Go to Supabase Dashboard → Settings → Database
2. Click **Reset database password**
3. Set a new password
4. Save it securely
5. Add it to both GitHub Environments

---

## What You Have (Already Set)

### GitHub Staging Environment
✅ `SUPABASE_URL`
✅ `SUPABASE_ANON_KEY`
✅ `SUPABASE_SERVICE_ROLE_KEY`
⏳ `SUPABASE_DB_PASSWORD` ← Add this

### GitHub Production Environment
⏳ All secrets need to be added (including the new password)

---

## Testing the Automated Migrations

### Once you add SUPABASE_DB_PASSWORD:

**Test Staging:**
```bash
git checkout develop
git commit --allow-empty -m "Test automated migrations"
git push origin develop
```

**Watch the workflow:**
1. Go to **Actions** tab in GitHub
2. Click on your workflow run
3. Expand "Apply Migrations (Staging)"
4. You should see:
   ```
   Linking to project: your-staging-ref
   ✓ Linked to project
   Applying migrations to staging database...
   ✓ Migration applied successfully
   ```

**Verify in Supabase:**
1. Go to Supabase Dashboard → Your staging project
2. Click **SQL Editor**
3. Run:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations
   ORDER BY version DESC;
   ```
4. You should see all 30 migrations listed as applied

---

## Your 30 Existing Migrations

All these will be automatically applied:

```
20251005223123_initial_schema.sql
20251005225300_seed_treatments.sql
20251005231500_seed_team_members.sql
20251006000800_setup_storage.sql
20251006002000_storage_rls_policies.sql
20251006003500_cms_foundation.sql
20251006130000_update_storage_policies.sql
20251006130001_add_bio_to_team.sql
20251006135600_add_website_content_tables.sql
20251006135601_add_initial_languages.sql
20251006135602_add_initial_settings.sql
20251006145000_add_insurance_providers.sql
20251006150000_add_payment_methods.sql
20251006155000_add_social_media.sql
20251006160000_update_insurance_with_logo.sql
20251006162000_update_payment_methods_with_icon.sql
20251006195900_enable_new_languages.sql
20251015210000_remove_old_insurance.sql
20251015211000_add_new_insurance.sql
20251015212000_add_advanced_settings.sql
20251015213000_move_contact_to_settings.sql
20251015214000_remove_old_payment_methods.sql
20251015215000_add_new_payment_methods.sql
20251015220000_remove_old_social_media.sql
20251015221000_add_new_social_media.sql
20251015222000_seed_clinic_settings.sql
20251015223000_seed_contact_settings.sql
20251015224000_seed_languages_settings.sql
20251015225000_seed_insurance_settings.sql
20251015230000_seed_payment_settings.sql
20251015231000_seed_social_media_settings.sql
```

---

## Workflow After Setup

### Creating New Migrations (Future)

1. **Make schema changes locally:**
   ```bash
   npx supabase start
   # Make changes via Studio: http://localhost:54323
   ```

2. **Generate migration file:**
   ```bash
   npx supabase db diff -f add_new_feature
   ```

3. **Test locally:**
   ```bash
   npx supabase db reset
   npm run dev
   ```

4. **Commit and push:**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: Add new feature to database"
   git push origin develop
   ```

5. **Automatic deployment:**
   - GitHub Actions detects new migration file
   - Applies migration to staging database
   - Builds Docker image (only if migration succeeds)
   - Deploys to Cloud Run staging
   - You see results in Actions tab

---

## Documentation Reference

📖 **Complete Guides:**
- [Automated Database Migrations Guide](./AUTOMATED-DATABASE-MIGRATIONS.md) - How it works, best practices, troubleshooting
- [Staging Database Setup](./STAGING-DATABASE-SETUP.md) - Initial setup for staging database
- [GitHub Environments Setup](./GITHUB-ENVIRONMENTS-SETUP.md) - Environment configuration

---

## Quick Commands Reference

### Add the Required Secret
```bash
# For Staging
gh secret set SUPABASE_DB_PASSWORD \
  --env Staging \
  --body "your-database-password"

# For Production
gh secret set SUPABASE_DB_PASSWORD \
  --env Production \
  --body "your-database-password"
```

### Test Staging Deployment
```bash
git checkout develop
git commit --allow-empty -m "Test automated migrations"
git push origin develop
```

### Verify Migrations Applied
```sql
-- Run in Supabase SQL Editor
SELECT
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

---

## What Happens on Next Push

When you push to `develop` (after adding the password):

1. ✅ Lint & Type Check passes
2. ✅ Build succeeds with staging secrets
3. ✅ Route tests pass
4. 🆕 **Migrations automatically apply to staging database**
5. ✅ Docker image builds (only if migrations succeed)
6. ✅ Deploys to cfb-website-staging
7. ✅ Smoke tests verify deployment

If migrations fail:
- Docker build is **skipped**
- Deployment is **skipped**
- You get clear error in Actions tab
- No risk to production

---

## Summary

✅ **Complete**: Automated migration jobs added to CI/CD
✅ **Complete**: Comprehensive documentation created
✅ **Complete**: All 30 existing migrations ready to apply
⏳ **Pending**: Add `SUPABASE_DB_PASSWORD` to GitHub Environments
⏳ **Pending**: Test with staging deployment

**Ready to go once you add the password!**

---

**Last Updated**: 2025-10-16
**Implementation Status**: Complete - Awaiting Final Secret
