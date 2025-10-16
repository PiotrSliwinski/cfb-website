# CI/CD Fix - Action Plan

## Current Error

```
ERROR: failed to build: invalid tag "gcr.io//cfb-website:..."
invalid reference format
```

**Root Cause**: `GCP_PROJECT_ID` GitHub secret is **not set** (empty), causing double slash `gcr.io//cfb-website`

## ✅ What We've Already Fixed (Your Codebase is Ready)

All code changes have been completed and committed:

- ✅ Removed dangerous debug routes exposing service role key (commit: `02a2bef`)
- ✅ Added admin API authentication system (commit: `02a2bef`)
- ✅ Updated CI/CD for server-only environment variables (commit: `902104e`)
- ✅ Fixed Dockerfile tailwindcss build error (commit: `3f36a53`)
- ✅ Fixed route tests - 100% passing (commit: `f12739f`)
- ✅ Created comprehensive setup documentation

**The code is correct. Only GitHub/GCP configuration is needed.**

---

## 🔴 Action Required: Configure GitHub Secrets

### Step 1: Set GCP_PROJECT_ID (Fixes the Build Error)

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `GCP_PROJECT_ID`
5. Value: Your Google Cloud project ID
   - Find it at: [Google Cloud Console](https://console.cloud.google.com)
   - Look at the top of the page in the project selector
   - Copy the **Project ID** (not the name or number)
   - Example: `my-clinic-project-123456`

**This alone will fix the Docker build error.**

---

### Step 2: Create GCP Service Account (If Not Exists)

1. Go to: [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **"Create Service Account"**
3. Name: `github-actions-deployer`
4. Click **"Create and Continue"**

**Grant these roles**:
- ✅ Cloud Run Admin
- ✅ Storage Admin
- ✅ Service Account User

5. Click **"Done"**
6. Click the service account email
7. Go to **"Keys"** tab
8. Click **"Add Key" → "Create New Key"**
9. Choose **JSON**
10. Download the JSON file

---

### Step 3: Set GCP_SA_KEY Secret

1. Open the downloaded JSON file in a text editor
2. Copy the **entire JSON content**
3. Go to GitHub: **Settings → Secrets and variables → Actions**
4. Click **"New repository secret"**
5. Name: `GCP_SA_KEY`
6. Value: Paste the entire JSON
7. Click **"Add secret"**

---

### Step 4: Rotate and Set Supabase Service Role Key

**⚠️ CRITICAL**: The service role key was exposed in public debug routes and MUST be rotated.

1. Go to: [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api)
2. Find **"Service Role Key"** section
3. Click **"Generate New Key"** or use the reset button
4. Copy the new service role key
5. Go to GitHub: **Settings → Secrets and variables → Actions**
6. Find or create: `SUPABASE_SERVICE_ROLE_KEY`
7. Paste the **NEW** key value
8. Click **"Update secret"**

---

### Step 5: Rename/Update Supabase Secrets

**Update these secrets to use server-only names** (no `NEXT_PUBLIC_` prefix):

#### SUPABASE_URL
1. Go to: [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api)
2. Copy the **"Project URL"** (e.g., `https://abc123.supabase.co`)
3. Go to GitHub: **Settings → Secrets and variables → Actions**
4. Create or update: `SUPABASE_URL`
5. Paste the URL

#### SUPABASE_ANON_KEY
1. Go to: [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api)
2. Copy the **"anon/public"** key
3. Go to GitHub: **Settings → Secrets and variables → Actions**
4. Create or update: `SUPABASE_ANON_KEY`
5. Paste the key

---

### Step 6: Optional - Google Places API (for Reviews)

Only needed if you want Google Reviews feature:

#### GOOGLE_PLACES_API_KEY
1. Go to: [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials" → "API Key"**
3. Restrict the key to **Places API**
4. Copy the API key
5. Go to GitHub: **Settings → Secrets and variables → Actions**
6. Create: `GOOGLE_PLACES_API_KEY`
7. Paste the key

#### GOOGLE_PLACE_ID
1. Use [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Search for your business
3. Copy the Place ID (e.g., `ChIJN1t_tDeuEmsRUsoyG83frY4`)
4. Go to GitHub: **Settings → Secrets and variables → Actions**
5. Create: `GOOGLE_PLACE_ID`
6. Paste the Place ID

**If not using reviews, leave these empty.**

---

## 🔐 Configure GCP Secret Manager (for Cloud Run)

After setting GitHub secrets, create matching secrets in GCP for runtime access:

### Create Secrets

1. Go to: [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Click **"Create Secret"** for each:

| Secret Name | Value |
|-------------|-------|
| `SUPABASE_URL` | Same as GitHub secret |
| `SUPABASE_ANON_KEY` | Same as GitHub secret |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEW rotated key** |
| `GOOGLE_PLACES_API_KEY` | Same as GitHub secret (optional) |
| `GOOGLE_PLACE_ID` | Same as GitHub secret (optional) |

### Grant Access to Service Account

```bash
# Replace with your actual values
PROJECT_ID="your-project-id"
SERVICE_ACCOUNT="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

Or via UI:
1. Go to each secret
2. Click **"Permissions"** tab
3. Click **"Grant Access"**
4. Add your service account
5. Role: **"Secret Manager Secret Accessor"**

---

## ✅ Verification Checklist

Before pushing to trigger CI/CD:

- [ ] `GCP_PROJECT_ID` is set in GitHub secrets
- [ ] `GCP_SA_KEY` is set with valid JSON service account key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` has been **rotated** (new key)
- [ ] `SUPABASE_URL` is set (no NEXT_PUBLIC prefix)
- [ ] `SUPABASE_ANON_KEY` is set (no NEXT_PUBLIC prefix)
- [ ] Optional: `GOOGLE_PLACES_API_KEY` if using reviews
- [ ] Optional: `GOOGLE_PLACE_ID` if using reviews
- [ ] All secrets created in GCP Secret Manager
- [ ] Service account has `secretmanager.secretAccessor` role

---

## 🚀 Test the Pipeline

### Option 1: Push to develop (Staging)
```bash
git push origin develop
```
- Triggers CI/CD
- Deploys to staging environment
- Safe to test

### Option 2: Manual Workflow Dispatch
1. Go to: **Actions → CI/CD Pipeline**
2. Click **"Run workflow"**
3. Select **"staging"**
4. Click **"Run workflow"**

### Option 3: Test Docker Build Locally First

```bash
docker build \
  --build-arg SUPABASE_URL="https://your-project.supabase.co" \
  --build-arg SUPABASE_ANON_KEY="eyJ..." \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  -t cfb-website:local-test .
```

If this succeeds, CI/CD should work too.

---

## 📊 Expected Pipeline Flow

Once secrets are configured:

1. ✅ **Lint & Type Check** - Validates code quality
2. ✅ **Build Application** - Creates production build
3. ✅ **Route Tests** - Tests all 38 routes (100% passing)
4. ✅ **Docker Build** - Creates container image
   - Tag: `gcr.io/YOUR_PROJECT_ID/cfb-website:COMMIT_SHA`
5. ✅ **Push to GCR** - Uploads image to Google Container Registry
6. ✅ **Deploy to Cloud Run** - Deploys to staging/production
7. ✅ **Smoke Tests** - Verifies deployment works

---

## 🆘 Troubleshooting

### "invalid tag" error persists
- ✅ Verify `GCP_PROJECT_ID` has no spaces/trailing characters
- ✅ Check Actions logs to see what value is being used
- ✅ Try deleting and recreating the secret

### "authentication required" when pushing to GCR
- ✅ Verify `GCP_SA_KEY` is valid JSON
- ✅ Check service account has "Storage Admin" role
- ✅ Try creating a new service account key

### Cloud Run deployment fails
- ✅ Verify secrets exist in GCP Secret Manager
- ✅ Check service account has `secretmanager.secretAccessor`
- ✅ Verify secret names match exactly (case-sensitive)

### Build succeeds but app crashes
- ✅ Check Cloud Run logs for errors
- ✅ Verify all required secrets are configured
- ✅ Test Docker image locally first

---

## 📚 Additional Resources

- [GitHub Actions Setup Guide](./GITHUB-ACTIONS-SETUP.md) - Comprehensive setup documentation
- [Google Cloud Console](https://console.cloud.google.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

---

## 🎯 Quick Summary

**What you need to do**:
1. Set `GCP_PROJECT_ID` in GitHub secrets ← **This fixes the error**
2. Set `GCP_SA_KEY` with service account JSON
3. **Rotate** `SUPABASE_SERVICE_ROLE_KEY` (was exposed)
4. Rename Supabase secrets (remove NEXT_PUBLIC prefix)
5. Create matching secrets in GCP Secret Manager
6. Grant service account access to Secret Manager

**Time estimate**: 15-20 minutes

**Priority**:
- 🔴 HIGH: GCP_PROJECT_ID, GCP_SA_KEY
- 🔴 CRITICAL: Rotate SUPABASE_SERVICE_ROLE_KEY
- 🟡 MEDIUM: Rename Supabase secrets
- 🟢 LOW: Google Places API (optional)

The codebase is ready. Once you configure these secrets, the CI/CD pipeline will work! 🚀
