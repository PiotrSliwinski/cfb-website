# GitHub Environments Setup Guide

**Last Updated**: 2025-10-16
**Version**: 3.0.0 (GitHub Environments with Clean Secret Names)

## Overview

This guide explains how to configure **GitHub Environments** for the multi-environment CI/CD pipeline. GitHub Environments provide a cleaner, more organized way to manage environment-specific secrets and deployment protection rules.

---

## What Changed

### ✅ New Approach (Cleaner!)

Instead of using prefixed secret names like `STAGING_SUPABASE_URL` and `PRODUCTION_SUPABASE_URL`, we now use:

- **GitHub Environments**: `Staging` and `Production`
- **Clean Secret Names**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc. (same names in both environments)
- **Suffix-based GCP Secrets**: `supabase-url-staging` and `supabase-url-production`

### Benefits

✅ **Simpler secret names** - No more `STAGING_*` or `PRODUCTION_*` prefixes
✅ **Better organization** - Secrets grouped by environment in GitHub UI
✅ **Deployment protection** - Can require approvals for production
✅ **Environment-specific variables** - Each environment has its own isolated secrets
✅ **Cleaner URLs** - Environment-specific deployment URLs

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│ GitHub Repository                                │
│                                                  │
│  Environments:                                   │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │    Staging      │    │   Production    │    │
│  │                 │    │                 │    │
│  │ Secrets:        │    │ Secrets:        │    │
│  │ - SUPABASE_URL  │    │ - SUPABASE_URL  │    │
│  │ - SUPABASE_...  │    │ - SUPABASE_...  │    │
│  │                 │    │                 │    │
│  │ Protection:     │    │ Protection:     │    │
│  │ - None          │    │ - Require       │    │
│  │                 │    │   approval      │    │
│  └─────────────────┘    └─────────────────┘    │
└─────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
    develop branch             main branch
           │                        │
           ▼                        ▼
   GCP Secrets (Runtime)    GCP Secrets (Runtime)
   - supabase-url-staging   - supabase-url-production
   - supabase-anon-...      - supabase-anon-...
```

---

## Step 1: Create GitHub Environments

### 1.1 Access Environments

1. Go to your repository on GitHub
2. Click **Settings** → **Environments**
3. You should see your existing `Production` and `Staging` environments

### 1.2 Configure Staging Environment

Click on **Staging** environment:

**Protection Rules**:
- ☐ Required reviewers: (none - auto-deploy from develop)
- ☐ Wait timer: (none)
- ✅ Deployment branches: `develop` only

**Environment Secrets** (click "Add Secret"):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SUPABASE_URL` | Staging Supabase URL | `https://staging-xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Staging anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `GOOGLE_PLACES_API_KEY` | Staging Google API (optional) | `AIzaSy...` |
| `GOOGLE_PLACE_ID` | Staging Place ID (optional) | `ChIJ...` |

### 1.3 Configure Production Environment

Click on **Production** environment:

**Protection Rules**:
- ✅ Required reviewers: Add yourself or team members
- ☐ Wait timer: 0 minutes (or add delay if desired)
- ✅ Deployment branches: `main` only

**Environment Secrets** (click "Add Secret"):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SUPABASE_URL` | Production Supabase URL | `https://production-xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Production anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service role | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `GOOGLE_PLACES_API_KEY` | Production Google API (optional) | `AIzaSy...` |
| `GOOGLE_PLACE_ID` | Production Place ID (optional) | `ChIJ...` |

---

## Step 2: Configure Repository Secrets (Shared)

Some secrets are shared across all environments:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `GOOGLE_PROJECT_ID` | GCP Project ID | `clinica-ferreira-borges` |
| `GCP_SA_KEY` | Service Account JSON | GCP Console → IAM |

---

## Step 3: Create GCP Secret Manager Secrets

Create secrets with environment suffix for Cloud Run runtime.

### 3.1 Authenticate with GCP

```bash
gcloud auth login
gcloud config set project clinica-ferreira-borges
gcloud services enable secretmanager.googleapis.com
```

### 3.2 Create Staging Secrets

```bash
# Supabase URL
echo -n "https://your-staging-project.supabase.co" | \
  gcloud secrets create supabase-url-staging \
  --data-file=- \
  --replication-policy="automatic"

# Supabase Anon Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-staging-anon-key..." | \
  gcloud secrets create supabase-anon-key-staging \
  --data-file=- \
  --replication-policy="automatic"

# Supabase Service Role Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-staging-service-role..." | \
  gcloud secrets create supabase-service-role-key-staging \
  --data-file=- \
  --replication-policy="automatic"

# Google Places API Key (optional)
echo -n "AIza...your-staging-api-key" | \
  gcloud secrets create google-places-api-key-staging \
  --data-file=- \
  --replication-policy="automatic"

# Google Place ID (optional)
echo -n "ChIJ...your-staging-place-id" | \
  gcloud secrets create google-place-id-staging \
  --data-file=- \
  --replication-policy="automatic"
```

### 3.3 Create Production Secrets

```bash
# Supabase URL
echo -n "https://your-production-project.supabase.co" | \
  gcloud secrets create supabase-url-production \
  --data-file=- \
  --replication-policy="automatic"

# Supabase Anon Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-production-anon-key..." | \
  gcloud secrets create supabase-anon-key-production \
  --data-file=- \
  --replication-policy="automatic"

# Supabase Service Role Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-production-service-role..." | \
  gcloud secrets create supabase-service-role-key-production \
  --data-file=- \
  --replication-policy="automatic"

# Google Places API Key (optional)
echo -n "AIza...your-production-api-key" | \
  gcloud secrets create google-places-api-key-production \
  --data-file=- \
  --replication-policy="automatic"

# Google Place ID (optional)
echo -n "ChIJ...your-production-place-id" | \
  gcloud secrets create google-place-id-production \
  --data-file=- \
  --replication-policy="automatic"
```

### 3.4 Grant Service Account Access

```bash
SERVICE_ACCOUNT="github-actions-deployer@clinica-ferreira-borges.iam.gserviceaccount.com"

# Staging secrets
for secret in \
  supabase-url-staging \
  supabase-anon-key-staging \
  supabase-service-role-key-staging \
  google-places-api-key-staging \
  google-place-id-staging
do
  echo "Granting access to: $secret"
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done

# Production secrets
for secret in \
  supabase-url-production \
  supabase-anon-key-production \
  supabase-service-role-key-production \
  google-places-api-key-production \
  google-place-id-production
do
  echo "Granting access to: $secret"
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done

echo "✅ All secrets configured!"
```

---

## Secret Naming Convention

### GitHub Environment Secrets (Build Time)

Same names in both `Staging` and `Production` environments:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_PLACES_API_KEY (optional)
GOOGLE_PLACE_ID (optional)
```

### GCP Secret Manager (Runtime)

Secrets with environment suffix:

**Staging**:
```
supabase-url-staging
supabase-anon-key-staging
supabase-service-role-key-staging
google-places-api-key-staging (optional)
google-place-id-staging (optional)
```

**Production**:
```
supabase-url-production
supabase-anon-key-production
supabase-service-role-key-production
google-places-api-key-production (optional)
google-place-id-production (optional)
```

---

## Verification

### Verify GitHub Environments

1. Go to **Settings** → **Environments**
2. Check **Staging** environment:
   - Should have 5 secrets (or 3 if Google API not used)
   - Protection rules: None
3. Check **Production** environment:
   - Should have 5 secrets (or 3 if Google API not used)
   - Protection rules: Required reviewers enabled

### Verify Repository Secrets

```bash
gh secret list
```

Expected output:
```
GCP_SA_KEY              2025-10-16
GOOGLE_PROJECT_ID       2025-10-16
```

### Verify GCP Secrets

```bash
gcloud secrets list
```

Expected output:
```
NAME                                CREATED
google-place-id-production          2025-10-16
google-place-id-staging             2025-10-16
google-places-api-key-production    2025-10-16
google-places-api-key-staging       2025-10-16
supabase-anon-key-production        2025-10-16
supabase-anon-key-staging           2025-10-16
supabase-service-role-key-production 2025-10-16
supabase-service-role-key-staging   2025-10-16
supabase-url-production             2025-10-16
supabase-url-staging                2025-10-16
```

### Test Deployment

```bash
# Test staging (auto-deploys from develop)
git checkout develop
git commit --allow-empty -m "Test staging deployment"
git push origin develop

# Test production (requires approval if configured)
git checkout main
git commit --allow-empty -m "Test production deployment"
git push origin main
```

---

## How It Works

### Build Time (GitHub Actions)

1. Workflow determines environment from branch
2. GitHub Actions loads secrets from appropriate Environment (`Staging` or `Production`)
3. Next.js build uses these secrets
4. Docker image built with build-time environment variables

### Runtime (Cloud Run)

1. Container starts
2. GCP Secret Manager secrets loaded based on environment suffix (`-staging` or `-production`)
3. Environment variables available to application
4. Application runs with environment-specific configuration

---

## Deployment Protection

### Staging (develop branch)

- ✅ Auto-deploys on push to `develop`
- ☐ No approval required
- ☐ No wait time
- Perfect for rapid testing

### Production (main branch)

- ⏸️ Requires manual approval (if configured)
- ✅ Reviewers notified
- ✅ Can add wait timer
- ✅ Deployment history tracked

To approve a production deployment:
1. Go to repository → **Actions**
2. Click on the workflow run
3. Click **Review deployments**
4. Select **Production**
5. Click **Approve and deploy**

---

## Comparison: Old vs New

### Old Approach (Prefixed Secrets)

```
Repository Secrets:
├── STAGING_SUPABASE_URL
├── STAGING_SUPABASE_ANON_KEY
├── PRODUCTION_SUPABASE_URL
└── PRODUCTION_SUPABASE_ANON_KEY

GCP Secrets:
├── staging-supabase-url
├── staging-supabase-anon-key
├── production-supabase-url
└── production-supabase-anon-key
```

### New Approach (GitHub Environments) ✅

```
Environment: Staging
├── SUPABASE_URL
└── SUPABASE_ANON_KEY

Environment: Production
├── SUPABASE_URL
└── SUPABASE_ANON_KEY

GCP Secrets:
├── supabase-url-staging
├── supabase-anon-key-staging
├── supabase-url-production
└── supabase-anon-key-production
```

**Benefits**:
- Cleaner GitHub UI (secrets grouped by environment)
- Same secret names across environments (easier to maintain)
- Deployment protection built-in
- Environment-specific URLs in GitHub Actions

---

## Troubleshooting

### Error: "Environment not found"

**Cause**: GitHub Environment not created

**Solution**:
```bash
# Check if environments exist
# Go to GitHub → Settings → Environments

# Create if missing:
# Click "New environment"
# Name: Staging (exact case)
# Name: Production (exact case)
```

### Error: "Secret not found"

**Cause**: Secret not added to environment

**Solution**:
1. Go to **Settings** → **Environments**
2. Click on environment name
3. Click **Add secret**
4. Add missing secret

### Deployment Stuck "Waiting for approval"

**Cause**: Production environment requires approval

**Solution**:
1. Go to **Actions** tab
2. Click on pending workflow
3. Click **Review deployments**
4. Approve deployment

### GCP Secret Access Denied

**Cause**: Service account doesn't have permission

**Solution**:
```bash
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:github-actions-deployer@clinica-ferreira-borges.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Quick Reference

### GitHub Environments

| Environment | Branch | Auto-Deploy | Approval | Secrets Count |
|-------------|--------|-------------|----------|---------------|
| Staging | `develop` | ✅ Yes | ☐ No | 5 (or 3) |
| Production | `main` | ⏸️ Manual | ✅ Yes | 5 (or 3) |

### Secret Names

**GitHub Environment Secrets** (same in both environments):
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_PLACES_API_KEY
GOOGLE_PLACE_ID
```

**GCP Secrets** (with suffix):
```
supabase-url-staging
supabase-url-production
supabase-anon-key-staging
supabase-anon-key-production
supabase-service-role-key-staging
supabase-service-role-key-production
google-places-api-key-staging
google-places-api-key-production
google-place-id-staging
google-place-id-production
```

---

## Next Steps

1. ✅ Create GitHub Environments (Staging and Production)
2. ✅ Add secrets to each environment
3. ✅ Configure GCP Secret Manager secrets
4. ✅ Grant service account access
5. ✅ Test staging deployment
6. ✅ Test production deployment
7. ✅ Configure deployment protection rules (optional)

---

## Related Documentation

- [Multi-Environment Setup Summary](./MULTI-ENVIRONMENT-SETUP-SUMMARY.md)
- [Supabase Multi-Environment Setup](./SUPABASE-MULTI-ENVIRONMENT-SETUP.md)
- [Environment Variables Guide](./ENVIRONMENT-VARIABLES-GUIDE.md)

---

**Last Updated**: 2025-10-16
**Version**: 3.0.0 (GitHub Environments)
