# Manual Deployment Guide

## Overview

The CI/CD pipeline now supports manual deployments through GitHub Actions' workflow dispatch feature. This allows you to trigger deployments on-demand without pushing code.

## How to Trigger Manual Deployment

### Method 1: GitHub Web UI

1. **Go to Actions Tab:**
   - Navigate to https://github.com/PiotrSliwinski/cfb-website/actions

2. **Select the Workflow:**
   - Click on "CI/CD Pipeline" in the left sidebar

3. **Run Workflow:**
   - Click the "Run workflow" button (top right)
   - A form will appear with the following options:

#### Deployment Options

**Environment to deploy:**
- `staging` - Deploy only to staging environment
- `production` - Deploy only to production environment
- `both` - Deploy to both staging and production (sequential)
- Default: `staging`

**Skip tests:**
- Checkbox to skip route tests
- ⚠️ Not recommended for production deployments
- Use only for hotfixes or when tests are known to pass
- Default: `false` (tests run)

**Force deploy:**
- Currently reserved for future use
- Forces deployment even if some checks fail
- Default: `false`

### Method 2: GitHub CLI

You can also trigger deployments using the GitHub CLI:

```bash
# Deploy to staging (with tests)
gh workflow run ci-cd.yml \
  --ref main \
  -f environment=staging \
  -f skip_tests=false

# Deploy to production (with tests)
gh workflow run ci-cd.yml \
  --ref main \
  -f environment=production \
  -f skip_tests=false

# Deploy to both environments
gh workflow run ci-cd.yml \
  --ref main \
  -f environment=both \
  -f skip_tests=false

# Quick hotfix to staging (skip tests)
gh workflow run ci-cd.yml \
  --ref main \
  -f environment=staging \
  -f skip_tests=true
```

### Method 3: GitHub API

```bash
# Using curl
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/PiotrSliwinski/cfb-website/actions/workflows/ci-cd.yml/dispatches \
  -d '{
    "ref": "main",
    "inputs": {
      "environment": "staging",
      "skip_tests": "false",
      "force_deploy": "false"
    }
  }'
```

## Workflow Behavior

### Automatic Deployments (Unchanged)

**Main Branch:**
- Push to `main` → Runs full pipeline → Deploys to **production**
- Includes: Lint, Type Check, Build, Tests, Docker Build, Deploy

**Develop Branch:**
- Push to `develop` → Runs full pipeline → Deploys to **staging**
- Includes: Lint, Type Check, Build, Tests, Docker Build, Deploy

**Pull Requests:**
- Opens PR → Runs: Lint, Type Check, Build, Tests
- No deployment

### Manual Deployments (New)

**Workflow Dispatch:**
- Can be triggered from any branch
- Runs: Lint, Type Check, Build, (Optional) Tests, Docker Build, Deploy
- Deployment target based on `environment` input parameter
- Tests can be skipped with `skip_tests` parameter

### Pipeline Stages

```
┌─────────────┐
│   Lint      │  ← Always runs
│   Type Check│
└──────┬──────┘
       │
┌──────▼──────┐
│   Build     │  ← Always runs
└──────┬──────┘
       │
┌──────▼──────┐
│ Route Tests │  ← Runs unless skip_tests=true
└──────┬──────┘
       │
┌──────▼──────┐
│Docker Build │  ← Runs if build succeeds
└──────┬──────┘
       │
   ┌───▼───┐
   │Deploy │  ← Based on environment input
   └───────┘
```

## Use Cases

### 1. Emergency Hotfix

If you need to deploy quickly without waiting for tests:

1. Merge hotfix to main
2. Go to Actions → CI/CD Pipeline → Run workflow
3. Select `production` environment
4. Check `skip_tests` (⚠️ use carefully)
5. Click "Run workflow"

### 2. Testing Staging Environment

Deploy current main branch to staging without creating a new commit:

1. Go to Actions → CI/CD Pipeline → Run workflow
2. Ensure branch is `main`
3. Select `staging` environment
4. Keep `skip_tests` unchecked
5. Click "Run workflow"

### 3. Synchronized Deployment

Deploy the same version to both staging and production:

1. Go to Actions → CI/CD Pipeline → Run workflow
2. Select `both` environment
3. Keep `skip_tests` unchecked
4. Click "Run workflow"

This will:
- Deploy to staging first
- Run smoke tests on staging
- If successful, deploy to production
- Run smoke tests on production

### 4. Re-deploy Previous Version

Deploy a specific commit/tag:

1. Go to Actions → CI/CD Pipeline → Run workflow
2. Select the branch/tag from dropdown
3. Choose environment
4. Click "Run workflow"

## Monitoring

### View Deployment Status

1. Go to Actions tab
2. Find your workflow run
3. Click to see detailed logs

### Check Deployment URLs

**Staging:**
- URL: `https://cfb-website-staging-{PROJECT_ID}.a.run.app`
- Listed in deployment logs

**Production:**
- URL: `https://clinicaferreiraborges.pt`
- Listed in deployment logs

### Smoke Tests

After each deployment, automated smoke tests run:
- Homepage health check: `GET /`
- API health check: `GET /api/settings`

If these fail, the deployment is marked as failed.

## Best Practices

### ✅ DO:
- Use manual deploy for emergency hotfixes
- Deploy to staging first to test changes
- Keep `skip_tests` unchecked for production
- Use `both` environment for major releases
- Check logs after deployment

### ❌ DON'T:
- Skip tests for production unless absolutely necessary
- Deploy without reviewing recent changes
- Deploy during high-traffic hours (unless emergency)
- Forget to verify smoke tests passed

## Rollback

If a deployment fails or causes issues:

### Quick Rollback

1. Find the last successful deployment commit/tag
2. Go to Actions → CI/CD Pipeline → Run workflow
3. Select that commit/tag from branch dropdown
4. Choose environment (staging/production)
5. Check `skip_tests` for faster rollback
6. Click "Run workflow"

### Manual Rollback via Cloud Run

```bash
# List revisions
gcloud run revisions list --service=cfb-website --region=europe-west1

# Rollback to specific revision
gcloud run services update-traffic cfb-website \
  --to-revisions=cfb-website-00001-abc=100 \
  --region=europe-west1
```

## Troubleshooting

### Workflow Not Appearing

- Refresh the Actions page
- Check you're on the correct repository
- Ensure you have write access to the repository

### Deployment Fails

1. Check the workflow logs for errors
2. Verify all GitHub Secrets are set:
   - `GCP_PROJECT_ID`
   - `GCP_SA_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Check Google Cloud Run service status
4. Review smoke test results

### Tests Fail

- Review test logs in the workflow
- Fix issues locally
- Push fix or use `skip_tests` for emergency

## Security Notes

- Only repository collaborators can trigger manual deployments
- All deployments are logged in GitHub Actions
- Deployment to production requires passing all previous jobs
- Secrets are never exposed in logs

## Related Documentation

- [CI/CD Setup Guide](CI_CD_SETUP.md)
- [Cloud Run Deployment](DEPLOYMENT-QUICK-START.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

**Last Updated:** 2025-10-15
**Pipeline Version:** 1.1 (with manual dispatch)
