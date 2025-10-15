# CI/CD Setup Guide - Clínica Ferreira Borges Website

Complete guide for setting up and using the CI/CD pipeline with GitHub Actions and Google Cloud Run.

## Overview

The CI/CD pipeline automatically builds, tests, and deploys your application whenever code is pushed to `main` or `develop` branches.

### Pipeline Stages

```
Push to GitHub
    ↓
1. Lint & Type Check (ESLint, TypeScript)
    ↓
2. Build Application (Next.js build)
    ↓
3. Route Tests (Automated route testing)
    ↓
4. Build Docker Image (Push to GCR)
    ↓
5. Deploy to Cloud Run (Staging or Production)
    ↓
6. Smoke Tests (Verify deployment)
```

## Features

### ✅ Automated Quality Checks
- **ESLint** - Code quality and style checking
- **TypeScript** - Type checking without emitting files
- **Build Verification** - Ensures application builds successfully
- **Route Testing** - Tests all 42+ routes automatically

### ✅ Deployment Strategy
- **Develop Branch** → Staging Environment
- **Main Branch** → Production Environment
- **Pull Requests** → Run tests only (no deployment)

### ✅ Optimizations
- **Docker Multi-stage Build** - Smaller images, faster deployments
- **NPM Cache** - Faster dependency installation
- **Build Artifacts** - Reuse build between jobs
- **Health Checks** - Automatic container health monitoring

## Prerequisites

### 1. Google Cloud Platform Setup

#### Create a GCP Project
```bash
gcloud projects create [PROJECT_ID]
gcloud config set project [PROJECT_ID]
```

#### Enable Required APIs
```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com
```

#### Create Service Account
```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:github-actions@[PROJECT_ID].iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:github-actions@[PROJECT_ID].iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:github-actions@[PROJECT_ID].iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@[PROJECT_ID].iam.gserviceaccount.com
```

#### Create Secrets in Google Secret Manager
```bash
# Create secrets for environment variables
echo -n "your-supabase-url" | gcloud secrets create NEXT_PUBLIC_SUPABASE_URL --data-file=-
echo -n "your-supabase-anon-key" | gcloud secrets create NEXT_PUBLIC_SUPABASE_ANON_KEY --data-file=-
echo -n "your-supabase-service-role-key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding NEXT_PUBLIC_SUPABASE_URL \
  --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding SUPABASE_SERVICE_ROLE_KEY \
  --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. GitHub Repository Setup

#### Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `cfb-website-prod` |
| `GCP_SA_KEY` | Service account JSON key | `{...json content...}` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |

#### Optional: Environment Protection Rules

For production deployments, set up environment protection:

1. Go to **Settings → Environments**
2. Create `production` environment
3. Add required reviewers
4. Add deployment branch rules (only `main`)

## Workflow Configuration

### File: `.github/workflows/ci-cd.yml`

The workflow is triggered on:
- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop` branches

### Jobs Breakdown

#### 1. Lint & Type Check
```yaml
- Checkout code
- Setup Node.js 20
- Install dependencies (npm ci)
- Run ESLint
- Run TypeScript type check
```

**Duration:** ~1-2 minutes
**Fail Policy:** Continue on error (warnings only)

#### 2. Build Application
```yaml
- Checkout code
- Setup Node.js 20
- Install dependencies
- Create .env file
- Build Next.js application
- Upload build artifacts
```

**Duration:** ~3-5 minutes
**Fail Policy:** Fail pipeline on error

#### 3. Route Tests
```yaml
- Checkout code
- Download build artifacts
- Start Next.js application
- Wait for server to be ready
- Run route tests (npm run test:routes)
- Stop application
```

**Duration:** ~2-3 minutes
**Fail Policy:** Fail pipeline on error

#### 4. Build & Push Docker Image
```yaml
- Checkout code
- Authenticate with GCP
- Configure Docker for GCR
- Build Docker image
- Push to Google Container Registry
```

**Duration:** ~5-8 minutes
**Fail Policy:** Fail pipeline on error
**Condition:** Only on push to main/develop

#### 5. Deploy to Cloud Run (Staging)
```yaml
- Authenticate with GCP
- Deploy to Cloud Run (staging environment)
- Run smoke tests
```

**Duration:** ~2-3 minutes
**Condition:** Only on push to develop branch

#### 6. Deploy to Cloud Run (Production)
```yaml
- Authenticate with GCP
- Deploy to Cloud Run (production environment)
- Run smoke tests
- Create deployment tag
```

**Duration:** ~2-3 minutes
**Condition:** Only on push to main branch

### Total Pipeline Duration

- **Pull Request:** ~6-10 minutes (no deployment)
- **Develop Push:** ~18-25 minutes (deploy to staging)
- **Main Push:** ~18-25 minutes (deploy to production)

## Deployment Environments

### Staging Environment

**Branch:** `develop`
**URL:** `https://cfb-website-staging-[PROJECT_ID].a.run.app`
**Resources:**
- Memory: 512Mi
- CPU: 1 vCPU
- Min Instances: 0
- Max Instances: 10

### Production Environment

**Branch:** `main`
**URL:** `https://clinicaferreiraborges.pt` (custom domain)
**Resources:**
- Memory: 1Gi
- CPU: 2 vCPU
- Min Instances: 1 (always warm)
- Max Instances: 100

## Usage

### Deploying to Staging

```bash
# Make changes on feature branch
git checkout -b feature/my-feature
git add .
git commit -m "Add new feature"
git push origin feature/my-feature

# Create PR to develop
# Once PR is merged, automatic deployment to staging

# Or push directly to develop
git checkout develop
git merge feature/my-feature
git push origin develop
```

### Deploying to Production

```bash
# Merge develop into main
git checkout main
git merge develop
git push origin main

# Pipeline will automatically:
# 1. Run all tests
# 2. Build Docker image
# 3. Deploy to production
# 4. Create deployment tag
```

### Manual Deployment (Emergency)

If you need to deploy manually:

```bash
# Build and push Docker image
docker build -t gcr.io/[PROJECT_ID]/cfb-website:manual .
docker push gcr.io/[PROJECT_ID]/cfb-website:manual

# Deploy to Cloud Run
gcloud run deploy cfb-website \
  --image=gcr.io/[PROJECT_ID]/cfb-website:manual \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated
```

## Monitoring and Debugging

### View Pipeline Logs

1. Go to **Actions** tab in GitHub
2. Click on the workflow run
3. Click on individual jobs to see logs

### View Cloud Run Logs

```bash
# View production logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cfb-website" --limit 50

# View staging logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cfb-website-staging" --limit 50

# Follow logs in real-time
gcloud run services logs tail cfb-website --region=europe-west1
```

### Common Issues

#### Issue: Build Fails with "Type Error"

**Solution:** Run `npm run lint` and `npx tsc --noEmit` locally to fix type errors before pushing.

#### Issue: Route Tests Fail

**Solution:**
1. Check that all routes return expected status codes
2. Run `npm run test:routes` locally
3. Fix failing routes

#### Issue: Docker Build Fails

**Solution:**
1. Check Dockerfile syntax
2. Verify build args are provided
3. Test build locally: `docker build -t test .`

#### Issue: Deployment Fails

**Solution:**
1. Check GCP service account permissions
2. Verify secrets are created in Secret Manager
3. Check Cloud Run quotas

#### Issue: Application Won't Start

**Solution:**
1. Check environment variables are set
2. Review Cloud Run logs
3. Verify health check endpoint works

## Testing Locally

### Test Docker Build

```bash
# Build the image
docker build -t cfb-website:local \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  cfb-website:local

# Test the application
curl http://localhost:3000
```

### Test Route Tests

```bash
# Start the application
npm run build
npm run start &

# Run tests
npm run test:routes

# Stop the application
kill $(lsof -ti:3000)
```

## Cost Optimization

### Current Configuration

**Staging:**
- Min instances: 0 (scales to zero)
- Memory: 512Mi
- Estimated cost: ~$5-10/month

**Production:**
- Min instances: 1 (always ready)
- Memory: 1Gi
- Estimated cost: ~$20-50/month

### Tips to Reduce Costs

1. **Set min instances to 0** for staging
2. **Use smaller memory** if possible (512Mi vs 1Gi)
3. **Set max instances** to prevent runaway scaling
4. **Use Cloud CDN** for static assets
5. **Enable Cloud Run concurrency** (default: 80)

## Security Best Practices

### ✅ Implemented

- [x] Non-root user in Docker container
- [x] Multi-stage Docker build (minimal final image)
- [x] Secrets stored in GCP Secret Manager
- [x] Service account with minimal permissions
- [x] Health checks enabled
- [x] No secrets in code or logs

### 🔒 Additional Recommendations

- [ ] Enable VPC connector for private Supabase
- [ ] Add WAF (Web Application Firewall)
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up monitoring alerts
- [ ] Implement rate limiting
- [ ] Enable audit logging

## Rollback Strategy

### Automatic Rollback

Cloud Run keeps previous revisions. To rollback:

```bash
# List revisions
gcloud run revisions list --service=cfb-website --region=europe-west1

# Rollback to previous revision
gcloud run services update-traffic cfb-website \
  --to-revisions=[REVISION_NAME]=100 \
  --region=europe-west1
```

### Manual Rollback via GitHub

1. Find the previous successful deployment tag
2. Create a new branch from that tag
3. Force push to main (with approval)

```bash
git checkout deploy-20250115-120000
git checkout -b rollback-to-previous
git push origin rollback-to-previous

# After review
git checkout main
git reset --hard deploy-20250115-120000
git push origin main --force
```

## Maintenance

### Weekly Tasks

- [ ] Review pipeline logs for warnings
- [ ] Check Cloud Run metrics (CPU, memory, requests)
- [ ] Review deployment tags and clean up old ones

### Monthly Tasks

- [ ] Update dependencies (npm update)
- [ ] Review and rotate service account keys
- [ ] Check Cloud Run quotas and limits
- [ ] Review and optimize costs

### Quarterly Tasks

- [ ] Security audit
- [ ] Performance review
- [ ] Update Node.js version
- [ ] Review and update CI/CD pipeline

## Support and Resources

### Documentation
- [GitHub Actions](https://docs.github.com/en/actions)
- [Cloud Run](https://cloud.google.com/run/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Internal Docs
- [Route Testing](./ROUTE-TEST-RESULTS.md)
- [Available Routes](./AVAILABLE-ROUTES.md)
- [Testing Summary](./TESTING-SUMMARY.md)

## Troubleshooting Checklist

Before reaching out for support, check:

- [ ] All GitHub secrets are set correctly
- [ ] GCP service account has correct permissions
- [ ] Secrets exist in GCP Secret Manager
- [ ] Cloud Run API is enabled
- [ ] Container Registry API is enabled
- [ ] Application builds locally (`npm run build`)
- [ ] Tests pass locally (`npm run test:routes`)
- [ ] Docker builds locally
- [ ] Environment variables are set

---

**Last Updated:** 2025-10-15
**Version:** 1.0
**Maintainer:** Development Team
