# Automated Database Migrations

**Last Updated**: 2025-10-16
**Version**: 1.0.0

## Overview

Database migrations are now **fully automated** as part of the CI/CD pipeline. When you push code to `develop` or `main`, migrations are automatically applied to the corresponding Supabase database before deployment.

---

## How It Works

### Workflow

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
Build Docker Image
    ↓
Deploy to Cloud Run
    ↓
Smoke Tests
```

### Migration Jobs

Two new jobs have been added to the CI/CD pipeline:

#### Job 6: Apply Migrations (Staging)
- **Triggers**: Push to `develop` branch
- **Environment**: Staging
- **Actions**:
  1. Checks out code
  2. Installs Supabase CLI
  3. Links to staging Supabase project
  4. Applies all new migrations
  5. Verifies migrations succeeded

#### Job 7: Apply Migrations (Production)
- **Triggers**: Push to `main` branch
- **Environment**: Production
- **Actions**:
  1. Checks out code
  2. Installs Supabase CLI
  3. Links to production Supabase project
  4. Applies all new migrations
  5. Verifies migrations succeeded

---

## Required Secrets

For automated migrations to work, you need to add **one additional secret** to each GitHub Environment:

### Staging Environment

Go to **Settings → Environments → Staging** and add:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_DB_PASSWORD` | Database password | The password you set when creating the Supabase project |

### Production Environment

Go to **Settings → Environments → Production** and add:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_DB_PASSWORD` | Database password | The password you set when creating the Supabase project |

**Note**: This is the `postgres` user password, NOT the service role key.

---

## Creating New Migrations

### Local Development

1. **Make schema changes** in your local Supabase:

```bash
# Start local Supabase
npx supabase start

# Make changes via Supabase Studio
open http://localhost:54323
```

2. **Generate migration file**:

```bash
# Create a new migration from your changes
npx supabase db diff -f add_new_feature

# This creates: supabase/migrations/TIMESTAMP_add_new_feature.sql
```

3. **Review the migration**:

```bash
# Open the generated file
cat supabase/migrations/*_add_new_feature.sql
```

4. **Test locally**:

```bash
# Reset and apply all migrations
npx supabase db reset

# Verify everything works
npm run dev
```

5. **Commit and push**:

```bash
git add supabase/migrations/
git commit -m "feat: Add new feature to database"
git push origin develop  # For staging
```

### Automatic Deployment

When you push to `develop` or `main`:

1. **GitHub Actions** detects new migration files
2. **Supabase CLI** connects to the cloud database
3. **Migrations** are applied in order (by timestamp)
4. **Verification** checks migrations succeeded
5. **Docker build** proceeds (only if migrations succeed)
6. **Deployment** completes

---

## Migration Best Practices

### ✅ DO

**Write Idempotent Migrations**:
```sql
-- Good: Can run multiple times safely
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL
);

-- Add column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name text;
  END IF;
END $$;
```

**Use Transactions**:
```sql
BEGIN;

-- All your changes here
CREATE TABLE ...;
ALTER TABLE ...;

COMMIT;
```

**Test Locally First**:
```bash
npx supabase db reset  # Apply all migrations
npm run test:routes    # Test your app
```

**Add Rollback Plans**:
```sql
-- migration: 20251016_add_feature.sql
CREATE TABLE new_feature (...);

-- rollback (keep in comments or separate file):
-- DROP TABLE new_feature;
```

### ❌ DON'T

**Don't Modify Existing Migrations**:
```bash
# Bad: Editing already-applied migration
vim supabase/migrations/20251015_old_migration.sql
```

**Don't Delete Applied Migrations**:
```bash
# Bad: This will cause issues
rm supabase/migrations/20251015_old_migration.sql
```

**Don't Make Breaking Changes Without Strategy**:
```sql
-- Bad: Drops column immediately
ALTER TABLE users DROP COLUMN old_field;

-- Good: Gradual deprecation
-- 1. Add new column
-- 2. Migrate data
-- 3. Update code to use new column
-- 4. Remove old column in future migration
```

---

## Monitoring Migrations

### View Migration Status

**In GitHub Actions**:
1. Go to **Actions** tab
2. Click on your workflow run
3. Expand "Apply Migrations (Staging/Production)"
4. Check the logs

**Expected output**:
```
Linking to project: abcdefghijk
✓ Linked to project
Applying migrations to staging database...
Applying migration 20251016123456_add_new_feature.sql...
✓ Migration applied successfully
Checking migration status...
Applied migrations:
  20251005223123 initial_schema
  20251005225300 seed_treatments
  ...
  20251016123456 add_new_feature ← New!
```

### Verify in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (staging or production)
3. Click **SQL Editor**
4. Run:

```sql
-- Check migration history
SELECT *
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;

-- Verify your changes
SELECT * FROM your_new_table;
```

---

## Troubleshooting

### Migration Fails in CI/CD

**Symptom**: "Apply Migrations" job fails with SQL error

**Solution**:
```bash
# 1. Check the error in GitHub Actions logs

# 2. Test migration locally
npx supabase db reset
npx supabase migration up

# 3. Fix the migration file
vim supabase/migrations/TIMESTAMP_failing_migration.sql

# 4. Test again
npx supabase db reset

# 5. Commit and push
git add supabase/migrations/
git commit -m "fix: Correct migration SQL"
git push origin develop
```

### Missing SUPABASE_DB_PASSWORD Secret

**Error**: "Failed to link to Supabase project"

**Solution**:
1. Go to **Settings → Environments → [Staging/Production]**
2. Click **Add secret**
3. Name: `SUPABASE_DB_PASSWORD`
4. Value: Your database password (from when you created the project)

**If you forgot the password**:
1. Go to Supabase Dashboard → Settings → Database
2. Click **Reset database password**
3. Set new password
4. Update the GitHub Environment secret

### Migration Applied but Code Breaks

**Symptom**: Deployment succeeds but app crashes

**Cause**: Migration changed schema but code wasn't updated

**Solution**:
```bash
# 1. Update your TypeScript types
npx supabase gen types typescript --linked > src/types/database.types.ts

# 2. Update code to use new schema
# ... make code changes ...

# 3. Test locally
npm run dev

# 4. Commit and push together
git add src/types/database.types.ts src/...
git commit -m "feat: Update code for new schema"
git push origin develop
```

### Migration Order Issues

**Symptom**: Migration fails due to missing dependencies

**Cause**: Migration files not in correct order

**Solution**:
```bash
# Migrations run in alphabetical order by filename
# Make sure timestamps are correct

# Check migration order
ls -1 supabase/migrations/

# Rename if needed (be careful!)
mv supabase/migrations/20251016120000_*.sql \
   supabase/migrations/20251016130000_*.sql
```

---

## Emergency Rollback

If a migration causes production issues:

### Option 1: Revert the Migration

```bash
# 1. Create rollback migration
npx supabase migration new rollback_problematic_change

# 2. Write rollback SQL
vim supabase/migrations/*_rollback_problematic_change.sql
```

```sql
-- Rollback migration
BEGIN;

-- Undo the changes
DROP TABLE IF EXISTS problematic_table;
-- Or ALTER TABLE to restore previous state

COMMIT;
```

```bash
# 3. Push to deploy rollback
git add supabase/migrations/
git commit -m "fix: Rollback problematic migration"
git push origin main
```

### Option 2: Manual Rollback

```bash
# Connect to production database
npx supabase link --project-ref PRODUCTION_REF

# Open SQL Editor in Supabase Dashboard
# Run rollback SQL manually

# OR via psql
psql "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

Then run your rollback SQL.

---

## Migration Workflow Examples

### Example 1: Add New Table

```bash
# 1. Create migration
npx supabase migration new create_blog_posts

# 2. Edit migration file
vim supabase/migrations/*_create_blog_posts.sql
```

```sql
-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Indexes
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_created ON blog_posts(created_at DESC);
```

```bash
# 3. Test locally
npx supabase db reset
npm run dev

# 4. Generate TypeScript types
npx supabase gen types typescript --local > src/types/database.types.ts

# 5. Commit and push
git add supabase/migrations/ src/types/
git commit -m "feat: Add blog posts table"
git push origin develop

# Migration will automatically apply to staging!
```

### Example 2: Modify Existing Table

```bash
# 1. Create migration
npx supabase migration new add_user_bio

# 2. Edit migration file
```

```sql
-- Add bio column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Add index if bio will be searched
CREATE INDEX IF NOT EXISTS idx_profiles_bio ON profiles USING gin(to_tsvector('english', bio));
```

```bash
# 3. Test and deploy (same as Example 1)
```

---

## Viewing Migration History

### In GitHub Actions

Check the workflow run logs to see which migrations were applied.

### In Supabase Dashboard

```sql
-- View migration history
SELECT
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

### Using Supabase CLI

```bash
# Link to project
npx supabase link --project-ref PROJECT_REF

# List migrations
npx supabase migration list --linked

# Output:
#   Applied migrations:
#     20251005223123 initial_schema
#     20251005225300 seed_treatments
#     ...
```

---

## Security Considerations

### Database Password

- Store in **GitHub Environment secrets** only
- Different password for staging and production
- Rotate every 90 days
- Never commit to Git

### Migration Files

- Review all migrations before merging
- No sensitive data in migrations (use env vars for seeds)
- Test in staging before production
- Code review required for production migrations

---

## Quick Reference

### Adding New Migration

```bash
# 1. Create migration
npx supabase migration new my_feature_name

# 2. Edit the file
vim supabase/migrations/*_my_feature_name.sql

# 3. Test locally
npx supabase db reset && npm run dev

# 4. Commit and push
git add supabase/migrations/
git commit -m "feat: Add my feature"
git push origin develop  # Auto-applies to staging
```

### Required Secrets

**Both Staging and Production Environments need**:
- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `SUPABASE_DB_PASSWORD` - Database password ← **NEW!**

### Deployment Flow

```
develop branch → Staging migrations → Staging deployment
main branch → Production migrations → Production deployment
```

---

## Related Documentation

- [GitHub Environments Setup](./GITHUB-ENVIRONMENTS-SETUP.md)
- [Staging Database Setup](./STAGING-DATABASE-SETUP.md)
- [Supabase Multi-Environment Setup](./SUPABASE-MULTI-ENVIRONMENT-SETUP.md)

---

**Last Updated**: 2025-10-16
**Status**: Automated migrations active
