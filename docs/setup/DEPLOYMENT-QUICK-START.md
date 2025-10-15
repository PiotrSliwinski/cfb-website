# Deployment Quick Start Guide

Fast setup guide for CI/CD pipeline. For detailed instructions, see [CICD-SETUP.md](./CICD-SETUP.md).

## 🚀 Quick Setup (5 minutes)

### 1. Google Cloud Platform Setup

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Enable APIs
gcloud services enable run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com

# Create service account
gcloud iam service-accounts create github-actions \
  --project=$PROJECT_ID

# Grant permissions
for role in roles/run.admin roles/storage.admin roles/secretmanager.secretAccessor roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="$role"
done

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Create secrets
echo -n "https://your-project.supabase.co" | gcloud secrets create NEXT_PUBLIC_SUPABASE_URL --data-file=-
echo -n "your-anon-key" | gcloud secrets create NEXT_PUBLIC_SUPABASE_ANON_KEY --data-file=-
echo -n "your-service-role-key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

# Grant Cloud Run access to secrets
for secret in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 2. GitHub Secrets Setup

Go to **GitHub Repository → Settings → Secrets and variables → Actions** and add:

```
GCP_PROJECT_ID = your-gcp-project-id
GCP_SA_KEY = <paste contents of github-actions-key.json>
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

### 3. Push and Deploy

```bash
# Commit the CI/CD files
git add .github/workflows/ci-cd.yml Dockerfile .dockerignore next.config.js
git commit -m "Add CI/CD pipeline"

# Push to develop (staging)
git push origin develop

# Or push to main (production)
git push origin main
```

## 📋 Files Created

- `.github/workflows/ci-cd.yml` - GitHub Actions workflow
- `Dockerfile` - Multi-stage Docker build
- `.dockerignore` - Optimize Docker build
- `next.config.js` - Updated with `output: 'standalone'`
- `docs/CICD-SETUP.md` - Detailed setup guide
- `docs/DEPLOYMENT-QUICK-START.md` - This file

## 🎯 Deployment Targets

| Branch | Environment | URL |
|--------|-------------|-----|
| `develop` | Staging | `https://cfb-website-staging-*.a.run.app` |
| `main` | Production | `https://clinicaferreiraborges.pt` |

## ✅ Pipeline Stages

1. **Lint & Type Check** (~2 min)
2. **Build Application** (~5 min)
3. **Route Tests** (~3 min)
4. **Docker Build & Push** (~8 min)
5. **Deploy to Cloud Run** (~3 min)
6. **Smoke Tests** (~1 min)

**Total:** ~22 minutes

## 🔍 Verify Deployment

```bash
# Check workflow status
gh run list --limit 5

# View logs
gh run view --log

# Test staging
curl https://cfb-website-staging-$PROJECT_ID.a.run.app

# Test production
curl https://clinicaferreiraborges.pt
```

## 🛠️ Common Commands

### View Deployments
```bash
gcloud run services list --region=europe-west1
```

### View Logs
```bash
gcloud run services logs tail cfb-website --region=europe-west1
```

### Rollback
```bash
gcloud run services update-traffic cfb-website \
  --to-revisions=[PREVIOUS_REVISION]=100 \
  --region=europe-west1
```

### Manual Deploy
```bash
gcloud run deploy cfb-website \
  --image=gcr.io/$PROJECT_ID/cfb-website:latest \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated
```

## 📊 Monitoring

### GitHub Actions
- View workflow runs: `https://github.com/PiotrSliwinski/cfb-website/actions`
- Check badges: See README.md (add status badge)

### Google Cloud Console
- Cloud Run: `https://console.cloud.google.com/run`
- Container Registry: `https://console.cloud.google.com/gcr`
- Logs: `https://console.cloud.google.com/logs`

## 🐛 Quick Troubleshooting

### Pipeline Fails at Lint
```bash
npm run lint -- --fix
npx tsc --noEmit
```

### Pipeline Fails at Build
```bash
npm run build
# Fix any build errors
```

### Pipeline Fails at Route Tests
```bash
npm run test:routes
# Fix failing routes
```

### Pipeline Fails at Docker Build
```bash
docker build -t test .
# Fix Dockerfile issues
```

### Deployment Fails
```bash
# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID

# Check if secrets exist
gcloud secrets list
```

## 💰 Cost Estimate

### Staging (develop)
- **Min Instances:** 0 (scales to zero)
- **Memory:** 512Mi
- **CPU:** 1 vCPU
- **Cost:** ~$5-10/month

### Production (main)
- **Min Instances:** 1 (always ready)
- **Memory:** 1Gi
- **CPU:** 2 vCPU
- **Cost:** ~$20-50/month

**Total Estimated Cost:** $25-60/month

## 📚 Additional Resources

- [Full CI/CD Setup Guide](./CICD-SETUP.md)
- [Route Testing](./ROUTE-TEST-RESULTS.md)
- [Available Routes](./AVAILABLE-ROUTES.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloud Run Docs](https://cloud.google.com/run/docs)

## ✨ What's Included

### Automated Testing
- ✅ ESLint code quality checks
- ✅ TypeScript type checking
- ✅ Next.js build verification
- ✅ 42+ route tests
- ✅ Smoke tests after deployment

### Deployment Features
- ✅ Multi-stage Docker build
- ✅ Automatic staging deployment (develop)
- ✅ Automatic production deployment (main)
- ✅ Health checks
- ✅ Auto-scaling
- ✅ Deployment tags

### Security
- ✅ Non-root Docker user
- ✅ Secrets in GCP Secret Manager
- ✅ Minimal service account permissions
- ✅ No secrets in code

## 🎉 Next Steps

After setup:

1. **Test staging:** Push to `develop` branch
2. **Verify deployment:** Check Cloud Run logs
3. **Test routes:** Visit staging URL
4. **Deploy to prod:** Merge `develop` → `main`
5. **Monitor:** Set up Cloud Monitoring alerts

---

**Setup Time:** ~5 minutes
**First Deployment:** ~22 minutes
**Subsequent Deployments:** ~22 minutes
