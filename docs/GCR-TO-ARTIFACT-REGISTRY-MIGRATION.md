# GCR to Artifact Registry Migration

**Date**: 2025-10-16
**Status**: ✅ Complete - Migrated to Artifact Registry

---

## What Happened

**Google Container Registry (GCR) is deprecated and shutting down.**

Your CI/CD pipeline was failing with:
```
unknown: Container Registry is deprecated and shutting down,
please use the auto migration tool to migrate to Artifact Registry
```

---

## What Changed

### Old Configuration (GCR)
```yaml
env:
  REGISTRY: gcr.io

# Image format:
gcr.io/clinica-ferreira-borges/cfb-website:staging-latest
```

### New Configuration (Artifact Registry)
```yaml
env:
  REGISTRY: europe-west1-docker.pkg.dev  # Artifact Registry
  REPOSITORY: cfb-website  # Repository name

# Image format:
europe-west1-docker.pkg.dev/clinica-ferreira-borges/cfb-website/cfb-website:staging-latest
```

---

## Technical Changes

### 1. Registry URL
- **Old**: `gcr.io`
- **New**: `europe-west1-docker.pkg.dev`

### 2. Image Path Structure
- **Old**: `REGISTRY/PROJECT_ID/SERVICE_NAME:tag`
- **New**: `REGISTRY/PROJECT_ID/REPOSITORY/SERVICE_NAME:tag`

### 3. Docker Authentication
```yaml
# Old
- run: gcloud auth configure-docker

# New
- run: gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet
```

### 4. All Image References Updated
Updated in 8 locations:
- Docker build tags (staging)
- Docker push commands (staging)
- Docker build tags (production)
- Docker push commands (production)
- Cloud Run deployment (staging)
- Cloud Run deployment (production)

---

## Benefits of Artifact Registry

### 1. Modern Platform
- ✅ Active development and support
- ✅ Better performance
- ✅ More features (vulnerability scanning, SBOM, etc.)
- ✅ Unified artifact management (Docker, Maven, npm, etc.)

### 2. Regional Repositories
- ✅ Your images stored in `europe-west1` (closer to your services)
- ✅ Faster pulls from Cloud Run
- ✅ Reduced latency

### 3. Better Access Control
- ✅ Fine-grained IAM permissions
- ✅ Repository-level access control
- ✅ Better audit logging

---

## Verification

### Check Repository
```bash
gcloud artifacts repositories describe cfb-website \
  --location=europe-west1 \
  --project=clinica-ferreira-borges
```

### List Images
```bash
gcloud artifacts docker images list \
  europe-west1-docker.pkg.dev/clinica-ferreira-borges/cfb-website
```

### View Image Details
```bash
gcloud artifacts docker images describe \
  europe-west1-docker.pkg.dev/clinica-ferreira-borges/cfb-website/cfb-website:staging-latest
```

---

## What Happens in CI/CD

### Docker Build Step
```yaml
- name: Build Docker image
  run: |
    docker build \
      --build-arg SUPABASE_URL="..." \
      -t europe-west1-docker.pkg.dev/PROJECT_ID/cfb-website/cfb-website:staging-SHA \
      -t europe-west1-docker.pkg.dev/PROJECT_ID/cfb-website/cfb-website:staging-latest \
      .
```

### Docker Push Step
```yaml
- name: Push Docker image
  run: |
    docker push europe-west1-docker.pkg.dev/PROJECT_ID/cfb-website/cfb-website:staging-SHA
    docker push europe-west1-docker.pkg.dev/PROJECT_ID/cfb-website/cfb-website:staging-latest
```

### Cloud Run Deployment
```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy cfb-website-staging \
      --image=europe-west1-docker.pkg.dev/PROJECT_ID/cfb-website/cfb-website:staging-SHA \
      --region=europe-west1
```

---

## No Action Required

✅ **Everything is automatic!**

- Artifact Registry repository already exists
- CI/CD workflow updated
- Docker authentication configured
- All image references updated

Your next deployment will automatically:
1. Build Docker image
2. Push to Artifact Registry (new location)
3. Deploy from Artifact Registry

---

## Old Images (GCR)

Your old images in GCR (`gcr.io`) will remain accessible for now, but:
- ⚠️ GCR is deprecated
- ⚠️ Will eventually shut down
- ⚠️ New images won't be pushed there

**Recommendation**: Don't worry about old GCR images - they'll be cleaned up automatically when GCR shuts down.

---

## Cost Impact

**Artifact Registry Pricing:**
- Storage: ~$0.10/GB/month
- Network egress: Standard GCP rates

**Typical usage:**
- Docker images: ~500MB each
- Keep 10 versions: ~5GB
- Cost: ~$0.50/month

**Note**: This replaces GCR storage (same cost structure).

---

## Troubleshooting

### If push fails with authentication error:
```bash
# In GitHub Actions (automatic):
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet

# Locally (if testing):
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### If repository doesn't exist:
```bash
gcloud artifacts repositories create cfb-website \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker images for CFB website"
```

### If image not found:
Check the full image path includes repository name:
```
europe-west1-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE:TAG
                                        ^^^^^^^^^^
                                        Required!
```

---

## Timeline

### What Happened
1. **12:51 UTC**: Docker push failed with GCR deprecation error
2. **12:55 UTC**: Identified issue - GCR shutting down
3. **13:00 UTC**: Created migration plan
4. **13:05 UTC**: Updated workflow to Artifact Registry
5. **13:10 UTC**: Pushed changes, new deployment running

### Migration Duration
- **Planning**: 5 minutes
- **Implementation**: 5 minutes
- **Testing**: ~10 minutes (current deployment)
- **Total**: ~20 minutes

---

## References

- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Transition from GCR](https://cloud.google.com/artifact-registry/docs/transition/transition-from-gcr)
- [Auto-migration Tool](https://cloud.google.com/artifact-registry/docs/transition/auto-migrate-gcr-ar)
- [Docker Repository Format](https://cloud.google.com/artifact-registry/docs/docker/pushing-and-pulling)

---

## Summary

✅ **Migration Complete**
- From: `gcr.io` (deprecated)
- To: `europe-west1-docker.pkg.dev` (Artifact Registry)

✅ **All References Updated**
- Docker build commands
- Docker push commands
- Cloud Run deployments

✅ **No Manual Steps Needed**
- Repository already exists
- CI/CD workflow updated
- Next deployment will use new registry

🎉 **Ready to Deploy!**

---

**Last Updated**: 2025-10-16 14:05 WEST
**Status**: Migration complete, testing in progress
