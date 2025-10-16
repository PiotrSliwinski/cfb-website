# Multi-Environment Secrets Setup Guide

**Updated**: 2025-10-16
**Version**: 2.0.0 (Multi-Environment)

This guide explains how to configure GitHub Secrets and GCP Secret Manager for the multi-environment deployment pipeline.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [GitHub Secrets Setup](#github-secrets-setup)
- [GCP Secret Manager Setup](#gcp-secret-manager-setup)
- [Quick Setup Commands](#quick-setup-commands)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CI/CD pipeline now supports **two independent environments**:

| Environment | Git Branch | Cloud Run Service | Docker Tag |
|-------------|------------|-------------------|------------|
| **Staging** | `develop` | `cfb-website-staging` | `staging-COMMIT_SHA` |
| **Production** | `main` | `cfb-website` | `COMMIT_SHA` |

Each environment uses **completely separate Supabase instances** and credentials for isolation.

---

## Architecture

### Deployment Flow

```
develop branch → Staging Build → Staging Supabase → staging-cfb-website
   ↓                 ↓                  ↓
STAGING_*        staging-*         Cloud Run Staging
secrets          GCP secrets

main branch → Production Build → Production Supabase → cfb-website
   ↓                 ↓                    ↓
PRODUCTION_*     production-*       Cloud Run Production
secrets          GCP secrets
```

### Secret Naming Convention

**GitHub Secrets**: `ENVIRONMENT_SECRET_NAME`
- Example: `STAGING_SUPABASE_URL`, `PRODUCTION_SUPABASE_URL`

**GCP Secret Manager**: `environment-secret-name`
- Example: `staging-supabase-url`, `production-supabase-url`

---

## GitHub Secrets Setup

### Required Secrets

You need to configure **13 total secrets** in GitHub:

#### Shared Secrets (3)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GOOGLE_PROJECT_ID` | GCP Project ID | `clinica-ferreira-borges` |
| `GCP_SA_KEY` | Service Account JSON | `{"type":"service_account"...}` |
| `GOOGLE_PLACES_API_KEY` | Google Places API (if shared) | `AIza...` (optional) |

#### Staging Secrets (5)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `STAGING_SUPABASE_URL` | Staging Supabase URL | Project Settings → API → Project URL |
| `STAGING_SUPABASE_ANON_KEY` | Staging anon key | Project Settings → API → anon public |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging service role | Project Settings → API → service_role |
| `STAGING_GOOGLE_PLACES_API_KEY` | Staging Google API (optional) | Google Cloud Console |
| `STAGING_GOOGLE_PLACE_ID` | Staging Place ID (optional) | Google Places API |

#### Production Secrets (5)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `PRODUCTION_SUPABASE_URL` | Production Supabase URL | Project Settings → API → Project URL |
| `PRODUCTION_SUPABASE_ANON_KEY` | Production anon key | Project Settings → API → anon public |
| `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY` | Production service role | Project Settings → API → service_role |
| `PRODUCTION_GOOGLE_PLACES_API_KEY` | Production Google API (optional) | Google Cloud Console |
| `PRODUCTION_GOOGLE_PLACE_ID` | Production Place ID (optional) | Google Places API |

### How to Add Secrets

#### Option 1: GitHub Web UI

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret one by one

#### Option 2: GitHub CLI (Recommended)

```bash
# Shared secrets
gh secret set GOOGLE_PROJECT_ID --body "clinica-ferreira-borges"
gh secret set GCP_SA_KEY < path/to/service-account-key.json
gh secret set GOOGLE_PLACES_API_KEY --body "AIza..."

# Staging secrets
gh secret set STAGING_SUPABASE_URL --body "https://your-staging-project.supabase.co"
gh secret set STAGING_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
gh secret set STAGING_SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
gh secret set STAGING_GOOGLE_PLACES_API_KEY --body "AIza..."
gh secret set STAGING_GOOGLE_PLACE_ID --body "ChIJ..."

# Production secrets
gh secret set PRODUCTION_SUPABASE_URL --body "https://your-production-project.supabase.co"
gh secret set PRODUCTION_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
gh secret set PRODUCTION_SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
gh secret set PRODUCTION_GOOGLE_PLACES_API_KEY --body "AIza..."
gh secret set PRODUCTION_GOOGLE_PLACE_ID --body "ChIJ..."
```

---

## GCP Secret Manager Setup

Cloud Run will load secrets from GCP Secret Manager at runtime for better security.

### Required GCP Secrets (10)

#### Staging Secrets (5)

```bash
staging-supabase-url
staging-supabase-anon-key
staging-supabase-service-role-key
staging-google-places-api-key
staging-google-place-id
```

#### Production Secrets (5)

```bash
production-supabase-url
production-supabase-anon-key
production-supabase-service-role-key
production-google-places-api-key
production-google-place-id
```

### Create GCP Secrets

#### Prerequisites

```bash
# Authenticate with GCP
gcloud auth login

# Set your project
gcloud config set project clinica-ferreira-borges

# Enable Secret Manager API (if not already enabled)
gcloud services enable secretmanager.googleapis.com
```

#### Create Staging Secrets

```bash
# Staging Supabase URL
echo -n "https://your-staging-project.supabase.co" | \
  gcloud secrets create staging-supabase-url \
  --data-file=- \
  --replication-policy="automatic"

# Staging Supabase Anon Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-staging-anon-key..." | \
  gcloud secrets create staging-supabase-anon-key \
  --data-file=- \
  --replication-policy="automatic"

# Staging Supabase Service Role Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-staging-service-role..." | \
  gcloud secrets create staging-supabase-service-role-key \
  --data-file=- \
  --replication-policy="automatic"

# Staging Google Places API Key (optional)
echo -n "AIza...your-staging-api-key" | \
  gcloud secrets create staging-google-places-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Staging Google Place ID (optional)
echo -n "ChIJ...your-staging-place-id" | \
  gcloud secrets create staging-google-place-id \
  --data-file=- \
  --replication-policy="automatic"
```

#### Create Production Secrets

```bash
# Production Supabase URL
echo -n "https://your-production-project.supabase.co" | \
  gcloud secrets create production-supabase-url \
  --data-file=- \
  --replication-policy="automatic"

# Production Supabase Anon Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-production-anon-key..." | \
  gcloud secrets create production-supabase-anon-key \
  --data-file=- \
  --replication-policy="automatic"

# Production Supabase Service Role Key
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-production-service-role..." | \
  gcloud secrets create production-supabase-service-role-key \
  --data-file=- \
  --replication-policy="automatic"

# Production Google Places API Key (optional)
echo -n "AIza...your-production-api-key" | \
  gcloud secrets create production-google-places-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Production Google Place ID (optional)
echo -n "ChIJ...your-production-place-id" | \
  gcloud secrets create production-google-place-id \
  --data-file=- \
  --replication-policy="automatic"
```

### Grant Service Account Access

Your GitHub Actions service account needs permission to access these secrets:

```bash
# Get your service account email
SERVICE_ACCOUNT="github-actions-deployer@clinica-ferreira-borges.iam.gserviceaccount.com"

# Grant access to ALL secrets
for secret in \
  staging-supabase-url \
  staging-supabase-anon-key \
  staging-supabase-service-role-key \
  staging-google-places-api-key \
  staging-google-place-id \
  production-supabase-url \
  production-supabase-anon-key \
  production-supabase-service-role-key \
  production-google-places-api-key \
  production-google-place-id
do
  echo "Granting access to: $secret"
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done

echo "✅ All secrets configured!"
```

---

## Quick Setup Commands

### Complete Setup Script

Save this as `setup-secrets.sh` and run it:

```bash
#!/bin/bash
set -e

echo "🔧 Multi-Environment Secrets Setup"
echo "===================================="
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set GCP project
gcloud config set project clinica-ferreira-borges

echo "📝 Step 1: GitHub Secrets"
echo "-------------------------"
echo "Please enter your credentials when prompted."
echo ""

# Shared secrets
read -p "Google Project ID [clinica-ferreira-borges]: " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-clinica-ferreira-borges}
gh secret set GOOGLE_PROJECT_ID --body "$PROJECT_ID"

read -p "Path to GCP Service Account JSON: " SA_PATH
gh secret set GCP_SA_KEY < "$SA_PATH"

# Staging secrets
echo ""
echo "🔵 Staging Environment"
read -p "Staging Supabase URL: " STAGING_URL
gh secret set STAGING_SUPABASE_URL --body "$STAGING_URL"

read -p "Staging Supabase Anon Key: " STAGING_ANON
gh secret set STAGING_SUPABASE_ANON_KEY --body "$STAGING_ANON"

read -p "Staging Supabase Service Role Key: " STAGING_SERVICE
gh secret set STAGING_SUPABASE_SERVICE_ROLE_KEY --body "$STAGING_SERVICE"

# Production secrets
echo ""
echo "🔴 Production Environment"
read -p "Production Supabase URL: " PROD_URL
gh secret set PRODUCTION_SUPABASE_URL --body "$PROD_URL"

read -p "Production Supabase Anon Key: " PROD_ANON
gh secret set PRODUCTION_SUPABASE_ANON_KEY --body "$PROD_ANON"

read -p "Production Supabase Service Role Key: " PROD_SERVICE
gh secret set PRODUCTION_SUPABASE_SERVICE_ROLE_KEY --body "$PROD_SERVICE"

echo ""
echo "📝 Step 2: GCP Secret Manager"
echo "-----------------------------"

# Create staging secrets
echo "Creating staging secrets..."
echo -n "$STAGING_URL" | gcloud secrets create staging-supabase-url --data-file=- --replication-policy="automatic" 2>/dev/null || \
  echo -n "$STAGING_URL" | gcloud secrets versions add staging-supabase-url --data-file=-

echo -n "$STAGING_ANON" | gcloud secrets create staging-supabase-anon-key --data-file=- --replication-policy="automatic" 2>/dev/null || \
  echo -n "$STAGING_ANON" | gcloud secrets versions add staging-supabase-anon-key --data-file=-

echo -n "$STAGING_SERVICE" | gcloud secrets create staging-supabase-service-role-key --data-file=- --replication-policy="automatic" 2>/dev/null || \
  echo -n "$STAGING_SERVICE" | gcloud secrets versions add staging-supabase-service-role-key --data-file=-

# Create production secrets
echo "Creating production secrets..."
echo -n "$PROD_URL" | gcloud secrets create production-supabase-url --data-file=- --replication-policy="automatic" 2>/dev/null || \
  echo -n "$PROD_URL" | gcloud secrets versions add production-supabase-url --data-file=-

echo -n "$PROD_ANON" | gcloud secrets create production-supabase-anon-key --data-file=- --replication-policy="automatic" 2>/dev/null || \
  echo -n "$PROD_ANON" | gcloud secrets versions add production-supabase-anon-key --data-file=-

echo -n "$PROD_SERVICE" | gcloud secrets create production-supabase-service-role-key --data-file=- --replication-policy="automatic" 2>/dev/null || \
  echo -n "$PROD_SERVICE" | gcloud secrets versions add production-supabase-service-role-key --data-file=-

echo ""
echo "📝 Step 3: Grant Service Account Access"
echo "---------------------------------------"

SERVICE_ACCOUNT="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

for secret in \
  staging-supabase-url \
  staging-supabase-anon-key \
  staging-supabase-service-role-key \
  production-supabase-url \
  production-supabase-anon-key \
  production-supabase-service-role-key
do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet
done

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify secrets: gh secret list"
echo "2. Verify GCP secrets: gcloud secrets list"
echo "3. Push to 'develop' branch to deploy to staging"
echo "4. Push to 'main' branch to deploy to production"
```

Make it executable and run:

```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

---

## Verification

### Verify GitHub Secrets

```bash
gh secret list
```

Expected output:
```
GCP_SA_KEY                          2025-10-16
GOOGLE_PLACES_API_KEY               2025-10-16
GOOGLE_PROJECT_ID                   2025-10-16
PRODUCTION_SUPABASE_ANON_KEY        2025-10-16
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY 2025-10-16
PRODUCTION_SUPABASE_URL             2025-10-16
STAGING_SUPABASE_ANON_KEY           2025-10-16
STAGING_SUPABASE_SERVICE_ROLE_KEY   2025-10-16
STAGING_SUPABASE_URL                2025-10-16
```

### Verify GCP Secrets

```bash
gcloud secrets list
```

Expected output:
```
NAME                                   CREATED
production-supabase-anon-key           2025-10-16
production-supabase-service-role-key   2025-10-16
production-supabase-url                2025-10-16
staging-supabase-anon-key              2025-10-16
staging-supabase-service-role-key      2025-10-16
staging-supabase-url                   2025-10-16
```

### Test Secret Access

```bash
# Test reading a secret
gcloud secrets versions access latest --secret="staging-supabase-url"

# Should output your Supabase URL
```

### Test Deployment

```bash
# Test staging deployment
git checkout develop
git commit --allow-empty -m "Test staging deployment"
git push origin develop

# Test production deployment
git checkout main
git commit --allow-empty -m "Test production deployment"
git push origin main
```

---

## Troubleshooting

### Secret Not Found

**Error**: `Secret [NAME] not found`

**Solution**:
```bash
# Check if secret exists
gcloud secrets list | grep staging

# Create if missing
echo -n "value" | gcloud secrets create secret-name --data-file=-
```

### Permission Denied

**Error**: `Permission 'secretmanager.versions.access' denied`

**Solution**:
```bash
# Grant access
gcloud secrets add-iam-policy-binding secret-name \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

### GitHub Secret Empty in Workflow

**Error**: Build args are empty in Docker build

**Solution**:
1. Verify secret exists: `gh secret list`
2. Check secret name matches exactly (case-sensitive)
3. Re-create the secret: `gh secret set SECRET_NAME --body "value"`

### Wrong Environment Deployed

**Error**: Staging credentials used in production

**Solution**:
1. Check branch: `git branch --show-current`
2. Verify workflow logic in `.github/workflows/ci-cd.yml`
3. Check environment outputs in GitHub Actions logs

### Docker Build Fails with Empty Variables

**Error**: `--build-arg SUPABASE_URL=` (empty)

**Solution**:
The secret name in GitHub might be wrong. Verify:
```bash
# For develop branch, needs:
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_SUPABASE_SERVICE_ROLE_KEY

# For main branch, needs:
PRODUCTION_SUPABASE_URL
PRODUCTION_SUPABASE_ANON_KEY
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY
```

---

## Security Best Practices

### Secret Rotation

Rotate secrets every 90 days:

```bash
# Generate new Supabase service role key in dashboard
# Update GitHub secret
gh secret set PRODUCTION_SUPABASE_SERVICE_ROLE_KEY --body "new-key"

# Update GCP secret
echo -n "new-key" | gcloud secrets versions add production-supabase-service-role-key --data-file=-

# Trigger redeployment
git commit --allow-empty -m "Rotate secrets"
git push
```

### Never Commit Secrets

✅ **DO**:
- Use GitHub Secrets for CI/CD
- Use GCP Secret Manager for runtime
- Use `.env.local` for local development (gitignored)

❌ **DON'T**:
- Commit `.env` files
- Hardcode secrets in code
- Use `NEXT_PUBLIC_` prefix for sensitive data
- Share secrets via Slack/email

### Audit Secret Access

```bash
# Check who has access to secrets
gcloud secrets get-iam-policy production-supabase-service-role-key

# Review Cloud Run environment
gcloud run services describe cfb-website --region=europe-west1
```

---

## Next Steps

1. ✅ Complete this secrets setup
2. ✅ Review [SUPABASE-MULTI-ENVIRONMENT-SETUP.md](./SUPABASE-MULTI-ENVIRONMENT-SETUP.md)
3. ✅ Create Supabase staging and production projects
4. ✅ Push to `develop` to test staging deployment
5. ✅ Push to `main` to test production deployment

---

## Reference Links

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GCP Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Run Secrets](https://cloud.google.com/run/docs/configuring/secrets)
- [Supabase Projects](https://supabase.com/dashboard)

---

**Last Updated**: 2025-10-16
**Maintainer**: DevOps Team
