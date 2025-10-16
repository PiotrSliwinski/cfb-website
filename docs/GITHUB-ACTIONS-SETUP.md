# GitHub Actions Setup Guide

## Problem

CI/CD pipeline is failing with:
```
ERROR: failed to build: invalid tag "gcr.io//cfb-website:..."
invalid reference format
```

**Root Cause**: The `GCP_PROJECT_ID` secret is not set in GitHub, causing an empty value in the Docker tag (`gcr.io//cfb-website` - notice the double slash).

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### 1. Google Cloud Platform Secrets

#### `GCP_PROJECT_ID`
- **Value**: Your GCP project ID (e.g., `my-project-123456`)
- **Where to find**:
  - Go to [Google Cloud Console](https://console.cloud.google.com)
  - Look at the top of the page or in the project selector
  - Copy the **Project ID** (not the project name or number)

#### `GCP_SA_KEY`
- **Value**: Service account JSON key
- **How to create**:
  1. Go to [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
  2. Create a new service account or select existing one
  3. Required roles:
     - **Cloud Run Admin** (to deploy services)
     - **Storage Admin** (to push Docker images to GCR)
     - **Service Account User** (to act as service accounts)
  4. Click "Keys" → "Add Key" → "Create New Key" → JSON
  5. Copy the entire JSON content into the GitHub secret

**Example format**:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-sa@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 2. Supabase Secrets (Server-Only)

#### `SUPABASE_URL`
- **Value**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project URL

#### `SUPABASE_ANON_KEY`
- **Value**: Your Supabase anonymous/public key
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service role key
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ IMPORTANT**: This key must be rotated after the security incident (debug routes exposure)

### 3. Google Places API Secrets (Optional)

#### `GOOGLE_PLACES_API_KEY`
- **Value**: Your Google Places API key
- **Where to find**: [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
- **Leave empty if not using Google Reviews feature**

#### `GOOGLE_PLACE_ID`
- **Value**: Your business's Google Place ID
- **How to find**: Use [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
- **Leave empty if not using Google Reviews feature**

## GCP Secret Manager Setup

After setting GitHub secrets, you also need to create secrets in **Google Cloud Secret Manager** for Cloud Run to access at runtime.

### Create Secrets

1. Go to [Google Cloud Console → Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Click "Create Secret"
3. Create these secrets:

| Secret Name | Value Source | Notes |
|------------|--------------|-------|
| `SUPABASE_URL` | Same as GitHub secret | Production Supabase URL |
| `SUPABASE_ANON_KEY` | Same as GitHub secret | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEW rotated key** | After rotating due to exposure |
| `GOOGLE_PLACES_API_KEY` | Same as GitHub secret | Optional |
| `GOOGLE_PLACE_ID` | Same as GitHub secret | Optional |

### Grant Service Account Access

Your GCP service account needs permission to access secrets:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

## Security Checklist

### ⚠️ CRITICAL: Rotate Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` was exposed in public debug routes. You **MUST** rotate it:

1. Go to Supabase Dashboard → Project Settings → API
2. Find "Service Role Key"
3. Click "Rotate Key" or "Generate New Key"
4. Update the key in:
   - ✅ GitHub Secrets → `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ GCP Secret Manager → `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ Any local `.env.local` files

### ✅ Security Best Practices

- ✅ Never commit secrets to Git
- ✅ Use different keys for staging/production
- ✅ Rotate keys after any potential exposure
- ✅ Use GCP Secret Manager (not environment variables in Cloud Run)
- ✅ Enable audit logging for secret access
- ✅ Use least-privilege service accounts

## Testing the Pipeline

After configuring all secrets:

1. **Test Locally** (optional):
   ```bash
   docker build \
     --build-arg SUPABASE_URL="https://xxx.supabase.co" \
     --build-arg SUPABASE_ANON_KEY="eyJ..." \
     --build-arg SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
     -t cfb-website:test .
   ```

2. **Trigger CI/CD**:
   - Push to `main` branch → deploys to production
   - Push to `develop` branch → deploys to staging
   - Or use manual trigger: Actions → CI/CD Pipeline → Run workflow

3. **Verify**:
   - Check Actions tab for pipeline status
   - Docker build should complete successfully
   - Image should be pushed to `gcr.io/PROJECT_ID/cfb-website:TAG`
   - Cloud Run deployment should succeed

## Troubleshooting

### "invalid tag" error persists
- Verify `GCP_PROJECT_ID` is set correctly in GitHub secrets
- Check the Actions logs to see the actual value being used
- Make sure there are no trailing spaces in the secret value

### "authentication required" when pushing to GCR
- Verify `GCP_SA_KEY` is a valid JSON service account key
- Check that the service account has "Storage Admin" role
- Try creating a new service account key

### Cloud Run deployment fails with "secret not found"
- Create the secrets in GCP Secret Manager
- Grant `roles/secretmanager.secretAccessor` to service account
- Verify secret names match exactly (case-sensitive)

### Build succeeds but app crashes at runtime
- Check Cloud Run logs for missing environment variables
- Verify all required secrets are configured in Secret Manager
- Test the Docker image locally first

## Quick Setup Checklist

- [ ] Set `GCP_PROJECT_ID` in GitHub secrets
- [ ] Set `GCP_SA_KEY` with proper roles in GitHub secrets
- [ ] Set `SUPABASE_URL` in GitHub secrets
- [ ] Set `SUPABASE_ANON_KEY` in GitHub secrets
- [ ] **Rotate and set new** `SUPABASE_SERVICE_ROLE_KEY` in GitHub secrets
- [ ] Set `GOOGLE_PLACES_API_KEY` (optional) in GitHub secrets
- [ ] Set `GOOGLE_PLACE_ID` (optional) in GitHub secrets
- [ ] Create matching secrets in GCP Secret Manager
- [ ] Grant service account access to Secret Manager
- [ ] Test pipeline by pushing to `develop` branch
- [ ] Verify staging deployment works
- [ ] Deploy to production via `main` branch

## Support

If you encounter issues:

1. Check the [GitHub Actions workflow logs](.github/workflows/ci-cd.yml)
2. Review [GCP Cloud Run documentation](https://cloud.google.com/run/docs)
3. Check [Supabase documentation](https://supabase.com/docs)
4. Review recent commits for environment variable changes
