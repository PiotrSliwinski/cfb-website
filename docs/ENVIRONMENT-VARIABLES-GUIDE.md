# Environment Variables Guide

**Last Updated**: 2025-10-16
**Version**: 2.0.0 (Multi-Environment)

## Quick Reference

This project uses **different environment variables** for each environment:

| Environment | Configuration Source | Variable Prefix | When Used |
|-------------|---------------------|-----------------|-----------|
| **Local** | `.env.local` | (none) | `npm run dev` |
| **Staging** | GitHub Secrets + GCP | `STAGING_*` | Push to `develop` |
| **Production** | GitHub Secrets + GCP | `PRODUCTION_*` | Push to `main` |

---

## Local Development Setup

### Step 1: Copy Example File

```bash
cp .env.example .env.local
```

### Step 2: Start Local Supabase

```bash
npx supabase start
```

The output will show your local credentials:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Update `.env.local`

Your `.env.local` should look like this:

```bash
# Supabase (from 'npx supabase start' output)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Places API (optional, for local testing)
GOOGLE_PLACES_API_KEY=AIza...your-key-here
GOOGLE_PLACE_ID=ChIJ...your-place-id
```

### Step 4: Start Development Server

```bash
npm run dev
```

Your app is now running at [http://localhost:3000](http://localhost:3000)

---

## Staging Environment

### Configuration

Staging uses **GitHub Secrets** for build time and **GCP Secret Manager** for runtime.

#### Required GitHub Secrets

```bash
STAGING_SUPABASE_URL=https://your-staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJ...staging-anon-key
STAGING_SUPABASE_SERVICE_ROLE_KEY=eyJ...staging-service-role
STAGING_GOOGLE_PLACES_API_KEY=AIza...staging-api-key (optional)
STAGING_GOOGLE_PLACE_ID=ChIJ...staging-place-id (optional)
```

#### Required GCP Secrets

```bash
staging-supabase-url
staging-supabase-anon-key
staging-supabase-service-role-key
staging-google-places-api-key (optional)
staging-google-place-id (optional)
```

### How to Set

See [MULTI-ENVIRONMENT-SECRETS-SETUP.md](./MULTI-ENVIRONMENT-SECRETS-SETUP.md) for detailed instructions.

### Deployment

```bash
git push origin develop
```

Automatic deployment to `cfb-website-staging` on Cloud Run.

---

## Production Environment

### Configuration

Production uses **GitHub Secrets** for build time and **GCP Secret Manager** for runtime.

#### Required GitHub Secrets

```bash
PRODUCTION_SUPABASE_URL=https://your-production-project.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=eyJ...production-anon-key
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY=eyJ...production-service-role
PRODUCTION_GOOGLE_PLACES_API_KEY=AIza...production-api-key (optional)
PRODUCTION_GOOGLE_PLACE_ID=ChIJ...production-place-id (optional)
```

#### Required GCP Secrets

```bash
production-supabase-url
production-supabase-anon-key
production-supabase-service-role-key
production-google-places-api-key (optional)
production-google-place-id (optional)
```

### How to Set

See [MULTI-ENVIRONMENT-SECRETS-SETUP.md](./MULTI-ENVIRONMENT-SECRETS-SETUP.md) for detailed instructions.

### Deployment

```bash
git push origin main
```

Automatic deployment to `cfb-website` on Cloud Run.

---

## Environment Variables Reference

### Supabase Variables

| Variable | Description | Required | Security |
|----------|-------------|----------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ Yes | Server-only |
| `SUPABASE_ANON_KEY` | Anon/public API key | ✅ Yes | Server-only* |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | ✅ Yes | Server-only |

\* While the anon key is designed to be public, we keep it server-only for better security with RLS.

**Where to Find**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Copy the values under "Project API keys"

### Google Places API Variables

| Variable | Description | Required | Security |
|----------|-------------|----------|----------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key | ⚠️ Optional | Server-only |
| `GOOGLE_PLACE_ID` | Your business Place ID | ⚠️ Optional | Server-only |

**Where to Find**:
1. **API Key**: [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   - Create API key
   - Enable "Places API (New)"
   - Restrict key to your domains

2. **Place ID**: [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
   - Search for your business
   - Copy the Place ID

**Note**: The app works without Google Places API. Reviews section will show a message that reviews are not configured.

---

## Security Best Practices

### ✅ DO

- Use `.env.local` for local development (gitignored)
- Use GitHub Secrets for CI/CD pipeline
- Use GCP Secret Manager for Cloud Run runtime
- Keep all Supabase keys server-only (no `NEXT_PUBLIC_` prefix)
- Rotate service role keys every 90 days
- Use different credentials for staging and production

### ❌ DON'T

- Commit `.env`, `.env.local`, or `.env.production` files
- Use `NEXT_PUBLIC_` prefix for Supabase keys
- Share secrets via Slack, email, or chat
- Reuse production credentials in staging
- Hardcode secrets in code
- Use the same database password across environments

---

## File Structure

```
cfb-website/
├── .env.example          # Template (committed to Git)
├── .env.local           # Local dev (gitignored, you create this)
├── .env                 # Auto-generated by build (gitignored)
└── .env.production      # Auto-generated by build (gitignored)
```

**Only `.env.example` is committed to Git** - all other `.env*` files are gitignored.

---

## Troubleshooting

### Error: "Missing Supabase credentials"

**Cause**: Environment variables not loaded

**Solution**:
```bash
# Local development
# 1. Check .env.local exists
ls -la .env.local

# 2. Verify Supabase is running
npx supabase status

# 3. Restart dev server
npm run dev
```

### Error: "Cannot connect to Supabase"

**Cause**: Wrong Supabase URL or credentials

**Solution**:
```bash
# Local development
# 1. Restart Supabase
npx supabase stop
npx supabase start

# 2. Copy new credentials to .env.local

# 3. Restart dev server
```

### Staging/Production Deployment Fails

**Cause**: Missing GitHub Secrets or GCP Secrets

**Solution**:
```bash
# 1. Verify GitHub Secrets
gh secret list

# Should show STAGING_* and PRODUCTION_* secrets

# 2. Verify GCP Secrets
gcloud secrets list

# Should show staging-* and production-* secrets

# 3. See setup guide
# docs/MULTI-ENVIRONMENT-SECRETS-SETUP.md
```

### Database Queries Return Empty Results

**Cause**: Wrong environment or empty database

**Solution**:
```bash
# Local development
# 1. Check if migrations applied
npx supabase migration list

# 2. Apply migrations
npx supabase db reset

# 3. Seed test data (if needed)
# See docs/SUPABASE-MULTI-ENVIRONMENT-SETUP.md
```

---

## How Environment Variables Are Loaded

### Local Development (`npm run dev`)

1. Next.js reads `.env.local`
2. Variables available in server-side code only
3. Supabase client initialized with local credentials

### CI/CD Build (GitHub Actions)

1. Workflow determines environment (staging vs production)
2. GitHub Secrets injected as environment variables
3. Next.js build uses appropriate `STAGING_*` or `PRODUCTION_*` secrets
4. Docker image built with build-time environment variables

### Cloud Run Runtime

1. Container starts
2. GCP Secret Manager secrets loaded at runtime
3. Environment variables available to application
4. Supabase client initialized with cloud credentials

---

## Environment Variable Precedence

Next.js loads environment variables in this order (later overrides earlier):

1. `.env` - Shared defaults (committed)
2. `.env.local` - Local overrides (gitignored)
3. `.env.production` - Production build (gitignored, auto-generated)
4. System environment variables - Highest priority

**For our setup**:
- Local: Uses `.env.local`
- CI/CD: Uses GitHub Secrets (system env vars)
- Cloud Run: Uses GCP Secret Manager (system env vars)

---

## Related Documentation

- 📖 [Multi-Environment Setup Summary](./MULTI-ENVIRONMENT-SETUP-SUMMARY.md)
- 📖 [Secrets Configuration Guide](./MULTI-ENVIRONMENT-SECRETS-SETUP.md)
- 📖 [Supabase Multi-Environment Setup](./SUPABASE-MULTI-ENVIRONMENT-SETUP.md)
- 📖 [Current Secrets Status](./SECRETS-STATUS.md)

---

## Quick Commands

```bash
# Local development
cp .env.example .env.local        # Create local env file
npx supabase start                # Start local Supabase
npm run dev                       # Start dev server

# View secrets
gh secret list                    # GitHub Secrets
gcloud secrets list               # GCP Secrets

# Deploy
git push origin develop           # Deploy to staging
git push origin main              # Deploy to production

# Troubleshooting
npx supabase status              # Check local Supabase
npx supabase migration list      # List applied migrations
npm run test:routes              # Test routes locally
```

---

**Last Updated**: 2025-10-16
**Environment Architecture**: Multi-environment (local, staging, production)
