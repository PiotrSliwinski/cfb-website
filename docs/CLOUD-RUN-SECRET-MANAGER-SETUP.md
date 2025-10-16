# Cloud Run Secret Manager Setup

**Date**: 2025-10-16
**Purpose**: Create Google Cloud Secret Manager secrets for Cloud Run deployment

---

## Overview

Cloud Run requires secrets to be stored in Google Cloud Secret Manager, not just GitHub. This guide shows how to create these secrets.

---

## Prerequisites

1. Secret Manager API enabled (see [SECRET-MANAGER-API-REQUIRED.md](./SECRET-MANAGER-API-REQUIRED.md))
2. gcloud CLI authenticated with project permissions
3. Values from your Supabase projects and Google APIs

---

## Quick Setup Script

### Staging Environment

```bash
#!/bin/bash

PROJECT_ID="clinica-ferreira-borges"

# Staging Supabase credentials
echo "Creating staging Supabase secrets..."

# SUPABASE_URL
echo -n "https://hkrpefnergidmviuewkt.supabase.co" | \
  gcloud secrets create supabase-url-staging \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# SUPABASE_ANON_KEY (get from Supabase Dashboard → Settings → API)
echo -n "YOUR_SUPABASE_ANON_KEY_HERE" | \
  gcloud secrets create supabase-anon-key-staging \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# SUPABASE_SERVICE_ROLE_KEY (get from Supabase Dashboard → Settings → API)
echo -n "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE" | \
  gcloud secrets create supabase-service-role-key-staging \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# Google API credentials
echo "Creating Google API secrets..."

# GOOGLE_PLACES_API_KEY
echo -n "YOUR_GOOGLE_PLACES_API_KEY" | \
  gcloud secrets create google-places-api-key-staging \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# GOOGLE_PLACE_ID
echo -n "YOUR_GOOGLE_PLACE_ID" | \
  gcloud secrets create google-place-id-staging \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

echo "✅ All staging secrets created!"
```

### Production Environment

```bash
#!/bin/bash

PROJECT_ID="clinica-ferreira-borges"

# Production Supabase credentials
echo "Creating production Supabase secrets..."

# SUPABASE_URL (your production Supabase project URL)
echo -n "https://YOUR_PRODUCTION_PROJECT.supabase.co" | \
  gcloud secrets create supabase-url-production \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# SUPABASE_ANON_KEY
echo -n "YOUR_PRODUCTION_SUPABASE_ANON_KEY_HERE" | \
  gcloud secrets create supabase-anon-key-production \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# SUPABASE_SERVICE_ROLE_KEY
echo -n "YOUR_PRODUCTION_SUPABASE_SERVICE_ROLE_KEY_HERE" | \
  gcloud secrets create supabase-service-role-key-production \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# Google API credentials (same as staging or production-specific)
echo "Creating Google API secrets..."

echo -n "YOUR_GOOGLE_PLACES_API_KEY" | \
  gcloud secrets create google-places-api-key-production \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

echo -n "YOUR_GOOGLE_PLACE_ID" | \
  gcloud secrets create google-place-id-production \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

echo "✅ All production secrets created!"
```

---

## Manual Creation (Via Console)

### Step 1: Open Secret Manager

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `clinica-ferreira-borges`
3. Navigate to: **Security → Secret Manager**
4. Or visit: https://console.cloud.google.com/security/secret-manager?project=clinica-ferreira-borges

### Step 2: Create Secrets

For each secret:

1. Click **"Create Secret"**
2. Enter **Name** (e.g., `supabase-url-staging`)
3. Enter **Secret value** (the actual API key, URL, etc.)
4. Click **"Create Secret"**

### Required Secrets for Staging

| Secret Name | Value Source | Example |
|-------------|--------------|---------|
| `supabase-url-staging` | Supabase Dashboard → Project Settings | `https://hkrpefnergidmviuewkt.supabase.co` |
| `supabase-anon-key-staging` | Supabase Dashboard → Settings → API | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `supabase-service-role-key-staging` | Supabase Dashboard → Settings → API | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `google-places-api-key-staging` | Google Cloud Console → APIs & Services → Credentials | `AIzaSy...` |
| `google-place-id-staging` | Google Places API / Maps | `ChIJ...` |

### Required Secrets for Production

| Secret Name | Value Source | Example |
|-------------|--------------|---------|
| `supabase-url-production` | Supabase Dashboard → Project Settings | `https://YOUR_PROJECT.supabase.co` |
| `supabase-anon-key-production` | Supabase Dashboard → Settings → API | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `supabase-service-role-key-production` | Supabase Dashboard → Settings → API | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `google-places-api-key-production` | Google Cloud Console → APIs & Services → Credentials | `AIzaSy...` |
| `google-place-id-production` | Google Places API / Maps | `ChIJ...` |

---

## Where to Find Values

### Supabase Credentials

1. **Go to**: https://supabase.com/dashboard
2. **Select your project** (staging: `hkrpefnergidmviuewkt`)
3. **Click**: Settings (gear icon) → API
4. **Copy**:
   - Project URL (e.g., `https://hkrpefnergidmviuewkt.supabase.co`)
   - `anon` key (public)
   - `service_role` key (secret, server-only)

### Google Places API Key

1. **Go to**: https://console.cloud.google.com/apis/credentials?project=clinica-ferreira-borges
2. **Find**: API key for Places API
3. **Copy**: The API key (starts with `AIzaSy`)

### Google Place ID

Your clinic's place ID from Google Maps/Places.

---

## Grant Cloud Run Access to Secrets

Cloud Run needs permission to read these secrets:

```bash
PROJECT_ID="clinica-ferreira-borges"
PROJECT_NUMBER="121166128087"  # Your project number

# Grant Secret Manager Secret Accessor role to Cloud Run service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Or grant per-secret:

```bash
# For each secret
gcloud secrets add-iam-policy-binding supabase-url-staging \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID
```

---

## Verify Secrets

### List All Secrets

```bash
gcloud secrets list --project=clinica-ferreira-borges
```

Expected output:
```
NAME                                CREATE_TIME          REPLICATION_POLICY
google-place-id-production          2025-10-16T15:00:00  automatic
google-place-id-staging             2025-10-16T15:00:00  automatic
google-places-api-key-production    2025-10-16T15:00:00  automatic
google-places-api-key-staging       2025-10-16T15:00:00  automatic
supabase-anon-key-production        2025-10-16T15:00:00  automatic
supabase-anon-key-staging           2025-10-16T15:00:00  automatic
supabase-service-role-key-production 2025-10-16T15:00:00 automatic
supabase-service-role-key-staging   2025-10-16T15:00:00  automatic
supabase-url-production             2025-10-16T15:00:00  automatic
supabase-url-staging                2025-10-16T15:00:00  automatic
```

### View Secret Metadata

```bash
gcloud secrets describe supabase-url-staging \
  --project=clinica-ferreira-borges
```

### Access Secret Value (Testing)

```bash
gcloud secrets versions access latest \
  --secret="supabase-url-staging" \
  --project=clinica-ferreira-borges
```

---

## Update Existing Secret

If you need to update a secret:

```bash
# Add a new version
echo -n "NEW_VALUE_HERE" | \
  gcloud secrets versions add supabase-url-staging \
    --data-file=- \
    --project=clinica-ferreira-borges
```

Cloud Run automatically uses the `:latest` version.

---

## Cost

**Secret Manager Pricing**:
- First 6 secrets: Free
- Additional secrets: $0.06 per secret per month
- Access operations: $0.03 per 10,000 operations

**Your usage**:
- Staging: 5 secrets
- Production: 5 secrets
- Total: 10 secrets
- Cost: ~$0.24/month (6 free + 4 × $0.06)

**Note**: Very minimal cost for security and convenience.

---

## Security Best Practices

### 1. Least Privilege Access
- Only grant `secretmanager.secretAccessor` role to services that need it
- Don't grant to users unless necessary

### 2. Secret Rotation
- Rotate secrets every 90 days
- Use versioning to track changes
- Test new version before promoting to `:latest`

### 3. Audit Logging
- Monitor secret access in Cloud Audit Logs
- Set up alerts for unexpected access

### 4. Backup
- Secrets are automatically backed up by Google
- Keep a secure copy of critical secrets elsewhere (password manager)

---

## Troubleshooting

### Error: "Secret not found"

**Cause**: Secret doesn't exist or wrong name

**Solution**:
```bash
# Check secret name
gcloud secrets list --project=clinica-ferreira-borges

# Create if missing
echo -n "VALUE" | gcloud secrets create SECRET_NAME --data-file=- --project=clinica-ferreira-borges
```

### Error: "Permission denied"

**Cause**: Cloud Run service account lacks permission

**Solution**:
```bash
# Grant access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:121166128087-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=clinica-ferreira-borges
```

### Error: "Secret Manager API not enabled"

**Cause**: API not enabled

**Solution**: See [SECRET-MANAGER-API-REQUIRED.md](./SECRET-MANAGER-API-REQUIRED.md)

---

## After Setup

Once all secrets are created:

1. **Test deployment**:
   ```bash
   git commit --allow-empty -m "test: Deploy with Secret Manager"
   git push origin develop
   ```

2. **Watch workflow**:
   ```bash
   gh run watch
   ```

3. **Verify deployment**:
   ```bash
   curl https://cfb-website-staging-clinica-ferreira-borges.run.app
   ```

---

## Summary

**Required Actions**:
1. ✅ Enable Secret Manager API
2. ⏳ Create 5 secrets for staging
3. ⏳ Grant Cloud Run access to secrets
4. ⏳ Test deployment

**Time Required**: ~10 minutes

**Commands**:
```bash
# Quick setup (replace values)
PROJECT_ID="clinica-ferreira-borges"

echo -n "https://hkrpefnergidmviuewkt.supabase.co" | gcloud secrets create supabase-url-staging --data-file=- --project=$PROJECT_ID --replication-policy="automatic"
echo -n "YOUR_ANON_KEY" | gcloud secrets create supabase-anon-key-staging --data-file=- --project=$PROJECT_ID --replication-policy="automatic"
echo -n "YOUR_SERVICE_ROLE_KEY" | gcloud secrets create supabase-service-role-key-staging --data-file=- --project=$PROJECT_ID --replication-policy="automatic"
echo -n "YOUR_GOOGLE_API_KEY" | gcloud secrets create google-places-api-key-staging --data-file=- --project=$PROJECT_ID --replication-policy="automatic"
echo -n "YOUR_PLACE_ID" | gcloud secrets create google-place-id-staging --data-file=- --project=$PROJECT_ID --replication-policy="automatic"

# Grant access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:121166128087-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

**Last Updated**: 2025-10-16 15:20 WEST
**Status**: Ready to create secrets

