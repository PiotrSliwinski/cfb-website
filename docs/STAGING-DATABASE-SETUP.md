# Staging Database Setup Guide

**Last Updated**: 2025-10-16
**Purpose**: Set up and seed your Supabase staging database with schema and initial data

---

## Prerequisites

Before you begin, make sure you have:
- ✅ Created a Supabase staging project
- ✅ Added secrets to GitHub Environment "Staging":
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Supabase CLI installed (`npm install -g supabase` or `brew install supabase/tap/supabase`)

---

## Step 1: Get Your Staging Project Reference

You need the **Project Reference ID** from your Supabase staging project.

### Find Project Reference

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **staging** project
3. Go to **Settings** → **General**
4. Find **Reference ID** (looks like: `abcdefghijklmnop`)

Or extract from your URL:
```
https://staging-project-ref.supabase.co
                     ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                     This is your project ref
```

---

## Step 2: Link Supabase CLI to Staging

### Save Your Staging Credentials

First, let's save your staging database password securely:

```bash
# The password you set when creating the Supabase project
# Save this somewhere safe (password manager)
```

### Link to Staging Project

```bash
# Navigate to your project
cd /Users/piotr/Source\ Code/Github/cfb-website

# Link to your staging project
supabase link --project-ref YOUR_STAGING_PROJECT_REF

# You'll be prompted for:
# 1. Database password (the one you set when creating the project)
```

**Example:**
```bash
$ supabase link --project-ref abcdefghijklmnop
Enter your database password: ••••••••••
Finished supabase link.
```

---

## Step 3: Review Migrations

You have **30 migration files** that will create your database structure:

```bash
# List all migrations
ls -1 supabase/migrations/

# You should see:
20251005223123_initial_schema.sql
20251005225300_seed_treatments.sql
20251005230109_seed_team_members.sql
20251006000000_setup_storage.sql
... (26 more files)
20251015000200_create_languages_system.sql
```

### What These Migrations Do

| Migration | Purpose |
|-----------|---------|
| `initial_schema.sql` | Creates core tables (treatments, team, FAQs, etc.) |
| `seed_treatments.sql` | Adds sample treatment data |
| `seed_team_members.sql` | Adds sample team member data |
| `setup_storage.sql` | Configures file storage buckets |
| `complete_treatment_*` | Adds detailed treatment information |
| `create_settings.sql` | Sets up clinic settings |
| `create_*_options.sql` | Payment options, insurance, etc. |
| `create_cms_*` | Content management system tables |
| `create_clinic_settings.sql` | Clinic configuration |
| `create_languages_system.sql` | Multi-language support |

---

## Step 4: Apply Migrations to Staging

### Push All Migrations

```bash
# This will apply ALL migrations in order
supabase db push

# You'll see output like:
# Applying migration 20251005223123_initial_schema.sql...
# Applying migration 20251005225300_seed_treatments.sql...
# ... (all 30 migrations)
# Finished applying migrations.
```

### Verify Migrations Applied

```bash
# Check which migrations have been applied
supabase migration list --remote

# You should see all 30 migrations marked as applied
```

---

## Step 5: Verify Database Structure

### Option 1: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **staging** project
3. Click **Table Editor** (left sidebar)
4. You should see all tables:
   - `treatments`
   - `team_members`
   - `faqs`
   - `settings`
   - `clinic_settings`
   - `languages`
   - ... and more

### Option 2: Using SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Count records in each table
SELECT
  'treatments' as table_name, COUNT(*) as count FROM treatments
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'clinic_settings', COUNT(*) FROM clinic_settings
UNION ALL
SELECT 'languages', COUNT(*) FROM languages;
```

### Option 3: Using Supabase CLI

```bash
# Connect to staging database
supabase db diff

# List tables
supabase db list
```

---

## Step 6: Verify Seed Data

Check that your seed data was created:

### Check Treatments

```sql
-- In Supabase Dashboard → SQL Editor
SELECT id, slug, title_pt, title_en, is_active
FROM treatments
ORDER BY created_at;
```

You should see sample treatments like:
- Implantes Dentários / Dental Implants
- Branqueamento Dentário / Teeth Whitening
- Ortodontia / Orthodontics
- etc.

### Check Team Members

```sql
SELECT id, name, role_pt, role_en, is_active
FROM team_members
ORDER BY display_order;
```

### Check Languages

```sql
SELECT code, name, is_default, is_active
FROM languages
ORDER BY code;
```

Should show:
- `pt` - Português (default)
- `en` - English

---

## Step 7: Test with Your Application

Now test that your staging environment can connect to the database:

### Option 1: Deploy to Staging

```bash
# Push to develop branch (deploys to staging)
git push origin develop
```

This will:
1. Build with Staging environment secrets
2. Deploy to `cfb-website-staging` on Cloud Run
3. Connect to your staging Supabase database

### Option 2: Test Locally with Staging Credentials

Create a temporary `.env.staging` file:

```bash
# .env.staging (DO NOT COMMIT)
SUPABASE_URL=https://your-staging-ref.supabase.co
SUPABASE_ANON_KEY=eyJ...your-staging-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-staging-service-role-key...
```

Then run:

```bash
# Load staging credentials and start dev server
export $(cat .env.staging | xargs) && npm run dev

# Visit http://localhost:3000
# App should connect to staging database
```

**Remember to delete `.env.staging` after testing!**

---

## Step 8: Add More Data (Optional)

If you want to add more sample data beyond the seed migrations:

### Create Additional Seed Script

```bash
# Create new migration
supabase migration new add_more_sample_data
```

Edit the file `supabase/migrations/TIMESTAMP_add_more_sample_data.sql`:

```sql
-- Add more FAQs
INSERT INTO faqs (question_pt, question_en, answer_pt, answer_en, category, display_order)
VALUES
  ('Como agendar consulta?', 'How to schedule appointment?',
   'Pode agendar por telefone ou email.', 'You can schedule by phone or email.',
   'general', 1),
  ('Aceitam seguros?', 'Do you accept insurance?',
   'Sim, trabalhamos com vários seguros.', 'Yes, we work with several insurance providers.',
   'general', 2);

-- Add more team members
INSERT INTO team_members (name, role_pt, role_en, bio_pt, bio_en, display_order)
VALUES
  ('Dr. João Silva', 'Implantologista', 'Implantologist',
   'Especialista em implantes dentários.', 'Specialist in dental implants.',
   10);

-- Add clinic settings
INSERT INTO clinic_settings (clinic_name, phone, email, address_pt, address_en)
VALUES
  ('Clínica Ferreira Borges', '+351 123 456 789', 'info@clinica.pt',
   'Rua Example, 123, Lisboa', 'Example Street, 123, Lisbon')
ON CONFLICT DO NOTHING;
```

Then apply:

```bash
supabase db push
```

---

## Troubleshooting

### Error: "Failed to link project"

**Cause**: Wrong project reference or database password

**Solution**:
```bash
# Try linking again with correct credentials
supabase link --project-ref YOUR_CORRECT_REF

# If you forgot the password, reset it in Supabase Dashboard:
# Settings → Database → Reset database password
```

### Error: "Migration already applied"

**Cause**: Trying to apply migrations that were already run

**Solution**:
```bash
# Check migration status
supabase migration list --remote

# If you need to reset (⚠️ DESTRUCTIVE):
# This will delete all data!
supabase db reset --db-url "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

### Error: "Permission denied"

**Cause**: Database user doesn't have necessary permissions

**Solution**:
```bash
# Make sure you're using the correct database password
# The password is for the 'postgres' superuser

# Verify connection:
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" -c "SELECT version();"
```

### No Data Showing in App

**Cause**: Wrong environment variables or RLS policies blocking access

**Solution**:
```bash
# 1. Verify environment secrets are correct
# GitHub → Settings → Environments → Staging

# 2. Check RLS policies allow public read
# In SQL Editor:
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

# 3. Verify anon key has permissions
# Test query via Supabase client
```

---

## Next Steps

After staging is set up:

1. ✅ **Verify Data**: Check all tables have expected data
2. ✅ **Test Deployment**: Deploy to staging and test all features
3. ✅ **Create Production**: Repeat this process for production environment
4. ✅ **Set Up Production Secrets**: Add to GitHub Environment "Production"
5. ✅ **Apply Migrations to Production**: `supabase link --project-ref PROD_REF && supabase db push`

---

## Quick Reference Commands

```bash
# Link to staging
supabase link --project-ref YOUR_STAGING_REF

# Apply all migrations
supabase db push

# Check migration status
supabase migration list --remote

# Create new migration
supabase migration new migration_name

# Reset database (⚠️ deletes all data)
supabase db reset

# Diff local vs remote
supabase db diff --linked

# Generate types (for TypeScript)
supabase gen types typescript --linked > src/types/database.types.ts
```

---

## Database Connection Strings

### For psql (Direct PostgreSQL Access)

```bash
# Staging (get from Supabase Dashboard → Settings → Database)
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Or via Supabase CLI
supabase db remote commit
```

### For Application (via Supabase Client)

```bash
# Uses environment variables
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJ...
```

---

## Security Checklist

- [ ] Staging database password saved in password manager
- [ ] GitHub Environment "Staging" configured with secrets
- [ ] GCP Secret Manager secrets created (`supabase-*-staging`)
- [ ] Service account has access to GCP secrets
- [ ] RLS policies enabled on all tables
- [ ] No sensitive data in seed migrations (use dummy data)
- [ ] `.env.staging` deleted (if created for testing)

---

## Related Documentation

- [GitHub Environments Setup](./GITHUB-ENVIRONMENTS-SETUP.md)
- [Supabase Multi-Environment Setup](./SUPABASE-MULTI-ENVIRONMENT-SETUP.md)
- [Environment Variables Guide](./ENVIRONMENT-VARIABLES-GUIDE.md)

---

**Last Updated**: 2025-10-16
**Status**: Ready to use for staging database setup
