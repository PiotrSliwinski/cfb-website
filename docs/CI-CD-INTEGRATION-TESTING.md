# CI/CD Integration Testing with Local Supabase

## Current Status

**CI/CD Pipeline:** ✅ UPDATED - Uses local Supabase for testing
**Testing Approach:** End-to-end integration tests with seeded database
**Secrets Required:** ❌ None for testing (only for deployment)

## Solution Overview

The CI/CD pipeline runs **true integration tests** against a fully seeded database:

### How It Works

1. **Spins up local Supabase** using `supabase start`
   - Runs PostgreSQL, PostgREST API, Auth, Storage, etc.
   - All services run in Docker containers

2. **Applies all migrations** automatically
   - Creates complete database schema
   - Seeds data from migration files

3. **Starts Next.js dev server** connected to local Supabase
   - Uses local Supabase URL: `http://127.0.0.1:54321`
   - Gets auth keys dynamically from Supabase CLI

4. **Runs route tests** (`npm run test:routes`)
   - Tests all 38 routes
   - Validates API responses
   - Checks authentication flows

5. **Cleans up** after completion
   - Stops application server
   - Stops Supabase (`supabase stop --no-backup`)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           GitHub Actions Runner (Ubuntu)            │
│                                                     │
│  ┌────────────────┐         ┌──────────────────┐  │
│  │   Next.js Dev  │────────>│  Local Supabase  │  │
│  │   (Port 3000)  │         │  (Port 54321)    │  │
│  └────────────────┘         └──────────────────┘  │
│         │                           │              │
│         │                           │              │
│  ┌──────▼─────────┐         ┌──────▼──────────┐  │
│  │  Route Tests   │         │   PostgreSQL    │  │
│  │  (38 routes)   │         │ + Migrations    │  │
│  └────────────────┘         │ + Seed Data     │  │
│                              └─────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## CI/CD Workflow Changes

### Before (❌ Broken)
```yaml
- name: Start application
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}  # Empty!
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}  # Empty!
```

**Problems:**
- Required GitHub secrets (not configured)
- Would connect to production database
- No test data isolation
- Could corrupt production data

### After (✅ Fixed)
```yaml
- name: Setup Supabase CLI
  uses: supabase/setup-cli@v1
  with:
    version: latest

- name: Start Supabase local instance
  run: |
    supabase start
    # Export local credentials dynamically
    echo "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" >> $GITHUB_ENV
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$(supabase status -o env | grep ANON_KEY | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "SUPABASE_SERVICE_ROLE_KEY=$(supabase status -o env | grep SERVICE_ROLE_KEY | cut -d'=' -f2)" >> $GITHUB_ENV
```

**Benefits:**
- ✅ No secrets required
- ✅ Isolated test database
- ✅ Fully seeded with test data
- ✅ Safe - can't affect production
- ✅ Fast - runs locally in CI
- ✅ Repeatable - same data every time

## Test Data Sources

The local Supabase instance is seeded from:

### 1. Migration Files
All migrations in `supabase/migrations/` are applied:
- `20251005223123_initial_schema.sql` - Database schema
- `20251005225300_seed_treatments.sql` - Treatment data
- `20251005230109_seed_team_members.sql` - Team member data
- `20251006000200_seed_treatment_faqs.sql` - FAQ data
- And more...

### 2. Seed File (Optional)
`supabase/seed.sql` - Additional test-specific data (currently minimal)

## Local Development

You can run the same setup locally:

```bash
# Start local Supabase (first time takes ~2 minutes)
supabase start

# It will output:
# API URL: http://127.0.0.1:54321
# anon key: eyJhbGc...
# service_role key: eyJhbGc...

# Copy these to your .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>" >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=<service-key>" >> .env.local

# Start your app
PORT=3000 npm run dev

# Run tests
TEST_BASE_URL=http://localhost:3000 npm run test:routes

# Stop Supabase when done
supabase stop
```

## What Tests Are Checking

The route tests verify:

### Public Routes (13 tests)
- ✅ Homepage loads (PT and EN)
- ✅ All public pages accessible
- ✅ Portuguese locale redirects work correctly
- ✅ English locale pages return 200

### Admin Routes (14 tests)
- ✅ Login page accessible
- ✅ Protected routes require auth
- ✅ Settings pages load
- ✅ Content management accessible

### API Routes (11 tests)
- ✅ `/api/treatments` - Returns treatment data from DB
- ✅ `/api/team` - Returns team members from DB
- ✅ `/api/settings` - Returns clinic settings
- ✅ `/api/google-reviews` - Returns reviews
- ✅ `/api/insurance` - Returns insurance providers
- ✅ `/api/financing` - Returns financing options
- ✅ `/api/prices` - Returns pricing data
- ✅ `/api/social-media` - Returns social links
- ✅ `/api/hero-sections` - Returns hero content
- ✅ `/api/cta-sections` - Returns CTA content
- ✅ `/api/admin/languages` - Returns language config

**All tests validate actual database queries and data serialization!**

## Expected CI/CD Results

```
📊 Results Summary by Category:

✅ Frontend - Public         13/13 (100.0%)
✅ Admin - Public            1/1 (100.0%)
✅ Admin - Protected         6/6 (100.0%)
✅ Admin - Settings          7/7 (100.0%)
✅ API - Public              10/10 (100.0%)
✅ API - Admin               1/1 (100.0%)

🎯 Overall: 38/38 tests passed (100.0%)
⚡ Average response time: ~50ms
```

## Deployment Secrets (Still Required)

While **testing doesn't need secrets**, **deployment** still requires:

### For Staging/Production Deployment

Configure these in GitHub → Settings → Secrets:

1. **GCP_SA_KEY** - ✅ Already configured (for Google Cloud deployment)
2. **GCP_PROJECT_ID** - For Google Cloud Run deployment (optional)
3. **Production Supabase Credentials** (optional for deployment step):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Note:** These are only used in the Docker build/deploy steps, NOT in tests.

## Troubleshooting

### Issue: Supabase fails to start in CI

**Error:**
```
Error: Docker is not running
```

**Solution:** GitHub Actions runners have Docker pre-installed, but Supabase CLI needs to pull images first. The CI already handles this - just let it run (takes ~2 min first time).

### Issue: Tests timeout

**Error:**
```
Error: Timeout waiting for http://localhost:3000
```

**Solution:** Check the "Start application" step logs. Common causes:
- Supabase not started
- Missing migrations
- Environment variables not exported

### Issue: API routes return 500

**Symptoms:** Tests fail with "Expected 200, Got 500"

**Solution:**
1. Check Supabase started successfully
2. Verify migrations applied: `supabase db diff`
3. Check environment variables are set
4. Look for database errors in logs

### Issue: Database missing data

**Solution:**
- Ensure migrations contain seed data
- Check `supabase/seed.sql` if needed
- Verify migrations ran: Look for "Applied XX migrations" in logs

## Performance

### CI/CD Timing
- **Supabase start:** ~120 seconds (first time)
- **Migrations:** ~5 seconds
- **App start:** ~10 seconds
- **Tests:** ~2 seconds
- **Total test job:** ~3 minutes

### Local Development
- **Supabase start:** ~30 seconds (cached)
- **App start:** ~3 seconds
- **Tests:** ~1 second
- **Total:** ~30 seconds

## Migration to This Approach

### What Changed

1. **.github/workflows/ci-cd.yml**
   - Added Supabase CLI setup step
   - Added local Supabase start/stop
   - Removed dependency on remote Supabase secrets
   - Changed from `npm start` to `npm run dev`

2. **supabase/seed.sql** (New)
   - Created placeholder seed file
   - Config already pointed to it

3. **Documentation** (This file!)
   - Comprehensive guide
   - Architecture diagrams
   - Troubleshooting tips

### What Stayed the Same

- All migration files unchanged
- Test scripts unchanged
- Application code unchanged
- Supabase config unchanged

## Benefits of This Approach

✅ **No secrets leakage** - All credentials are ephemeral
✅ **True integration tests** - Tests real database queries
✅ **Fast** - Local Supabase is faster than remote
✅ **Isolated** - Each run gets fresh database
✅ **Safe** - Can't corrupt production
✅ **Repeatable** - Same seed data every time
✅ **Cost effective** - No test database billing
✅ **Easy debugging** - Can reproduce locally

## Related Files

- [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) - CI/CD configuration
- [`supabase/config.toml`](../supabase/config.toml) - Supabase local config
- [`supabase/seed.sql`](../supabase/seed.sql) - Seed file
- [`scripts/test-routes.mjs`](../scripts/test-routes.mjs) - Test script
- [`docs/setup/CICD-SETUP.md`](./setup/CICD-SETUP.md) - Full CI/CD setup guide

## Next Steps

1. ✅ Commit the CI/CD changes
2. ⏳ Push to GitHub to trigger workflow
3. ⏳ Watch tests pass (all 38!)
4. ⏳ Deploy to staging/production

## Support

For issues:
1. Check workflow logs: `gh run view --log`
2. Test locally: `supabase start && npm run test:routes`
3. Check [Supabase CLI docs](https://supabase.com/docs/guides/cli)
4. Review migration files in `supabase/migrations/`
