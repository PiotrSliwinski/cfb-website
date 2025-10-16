# Supabase Multi-Environment Setup Guide

Complete guide for setting up staging and production Supabase instances with proper database migration management and secure credential handling.

## Table of Contents

- [Overview](#overview)
- [Environment Strategy](#environment-strategy)
- [Supabase Project Setup](#supabase-project-setup)
- [Database Migration Management](#database-migration-management)
- [Credential Management](#credential-management)
- [CI/CD Integration](#cicd-integration)
- [Deployment Workflow](#deployment-workflow)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide sets up a robust multi-environment deployment strategy:

- **Development** (local): Local Supabase instance with `supabase start`
- **Staging** (cloud): Testing environment for QA and pre-production validation
- **Production** (cloud): Live environment serving end users

**Key Principles**:
- Separate Supabase projects for isolation
- Git-branch-based deployments (develop → staging, main → production)
- Automated migration synchronization
- Secure credential management with GitHub Environments
- Zero-downtime deployments

---

## Environment Strategy

### Git Branch Mapping

| Git Branch | Environment | Supabase Project | Cloud Run Service | Purpose |
|-----------|-------------|------------------|-------------------|---------|
| `develop` | Staging | `cfb-staging` | `cfb-website-staging` | Pre-production testing |
| `main` | Production | `cfb-production` | `cfb-website-production` | Live site |
| Local dev | Development | Local instance | localhost:3000 | Feature development |

### Environment Variables Naming Convention

Use consistent naming with environment prefixes:

```bash
# GitHub Secrets - Staging
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_SUPABASE_SERVICE_ROLE_KEY

# GitHub Secrets - Production
PRODUCTION_SUPABASE_URL
PRODUCTION_SUPABASE_ANON_KEY
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY

# GCP Secret Manager - Staging
staging-supabase-url
staging-supabase-anon-key
staging-supabase-service-role-key

# GCP Secret Manager - Production
production-supabase-url
production-supabase-anon-key
production-supabase-service-role-key
```

---

## Supabase Project Setup

### Step 1: Create Supabase Projects

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**

**For Staging**:
- Project Name: `cfb-staging`
- Database Password: Generate strong password (save in password manager)
- Region: Choose closest to your users (e.g., `eu-west-1` for Europe)
- Pricing Plan: Free tier is fine for staging

**For Production**:
- Project Name: `cfb-production`
- Database Password: Generate different strong password
- Region: Same as staging for consistency
- Pricing Plan: Pro tier recommended for production

### Step 2: Retrieve Project Credentials

For **each project** (staging and production):

1. Go to **Project Settings → API**
2. Copy these values:

```bash
# Project URL
https://abcdefghijklmnop.supabase.co

# API Keys
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Go to **Project Settings → Database**
4. Copy **Connection String** (for migrations):

```
postgresql://postgres:[PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### Step 3: Link Projects to Supabase CLI

Install Supabase CLI (if not already installed):

```bash
npm install -g supabase
```

Link staging project:

```bash
# Create staging config
supabase link --project-ref abcdefghijklmnop --password [STAGING_DB_PASSWORD]

# This creates .supabase/ directory
# The config is stored locally - do NOT commit
```

**Note**: You can only link to one project at a time. We'll use environment-specific linking in CI/CD.

---

## Database Migration Management

### Migration Strategy

We use Supabase CLI migrations with the following workflow:

```
Local Dev → Staging → Production
    ↓           ↓          ↓
  Generate    Test      Deploy
  migration   changes   validated
  files                 changes
```

### Local Development Workflow

#### 1. Start Local Supabase

```bash
# Start local Supabase (first time or after reset)
supabase start

# This creates a local PostgreSQL instance
# Credentials are in the output (also in .env file created by supabase start)
```

#### 2. Make Schema Changes

Option A: **Use Supabase Studio** (recommended for beginners)

```bash
# Access local Studio
open http://localhost:54323

# Make changes via UI:
# - Table Editor for creating/modifying tables
# - SQL Editor for custom queries
```

Option B: **Write SQL Migration Files** (recommended for version control)

```bash
# Create a new migration
supabase migration new add_language_settings_table

# This creates: supabase/migrations/20250116_add_language_settings_table.sql
```

Edit the migration file:

```sql
-- supabase/migrations/20250116_add_language_settings_table.sql

-- Create language_settings table
CREATE TABLE IF NOT EXISTS public.language_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(10) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Language settings are viewable by everyone"
  ON public.language_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Language settings are modifiable by authenticated users"
  ON public.language_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index
CREATE INDEX idx_language_settings_code ON public.language_settings(code);

-- Insert default data
INSERT INTO public.language_settings (code, name, is_default, is_active)
VALUES
  ('pt', 'Português', true, true),
  ('en', 'English', false, true)
ON CONFLICT (code) DO NOTHING;
```

#### 3. Apply Migration Locally

```bash
# Apply all pending migrations
supabase db reset

# Or apply specific migration
supabase migration up
```

#### 4. Verify Changes

```bash
# Check migration status
supabase migration list

# Access local database
supabase db diff  # Shows differences from last migration
```

### Staging Deployment

#### 1. Push Migrations to Staging

```bash
# Link to staging project
supabase link --project-ref [STAGING_PROJECT_REF] --password [STAGING_DB_PASSWORD]

# Push migrations
supabase db push

# Verify
supabase migration list --remote
```

#### 2. Test in Staging Environment

- Deploy application to staging (via `develop` branch push)
- Run E2E tests
- Manual QA testing
- Verify data integrity

#### 3. Create Migration Rollback Plan

Always prepare a rollback migration before production deployment:

```bash
# Create rollback migration
supabase migration new rollback_add_language_settings_table
```

```sql
-- supabase/migrations/20250116_rollback_add_language_settings_table.sql

-- Drop the table (if needed)
DROP TABLE IF EXISTS public.language_settings CASCADE;

-- Note: Only create rollback if migration causes issues
-- Delete this file if deployment succeeds
```

### Production Deployment

#### 1. Merge to Main Branch

```bash
git checkout main
git merge develop
```

#### 2. Push Migrations to Production

```bash
# Link to production project
supabase link --project-ref [PRODUCTION_PROJECT_REF] --password [PRODUCTION_DB_PASSWORD]

# Review migrations to be applied
supabase migration list --remote

# Push migrations
supabase db push

# Verify
supabase migration list --remote
```

#### 3. Deploy Application

```bash
# Push to main branch (triggers CI/CD)
git push origin main
```

#### 4. Monitor Deployment

- Check Cloud Run logs
- Verify database queries work
- Monitor error rates
- Test critical user paths

---

## Credential Management

### GitHub Secrets Setup

#### Option 1: Repository Secrets (Simple)

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Create these secrets:

```bash
# Shared
GOOGLE_PROJECT_ID=clinica-ferreira-borges
GCP_SA_KEY={...service account JSON...}

# Staging
STAGING_SUPABASE_URL=https://staging-xxx.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJ...staging-anon-key...
STAGING_SUPABASE_SERVICE_ROLE_KEY=eyJ...staging-service-role...
STAGING_GOOGLE_PLACES_API_KEY=AIza...  # Optional
STAGING_GOOGLE_PLACE_ID=ChIJ...  # Optional

# Production
PRODUCTION_SUPABASE_URL=https://prod-xxx.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=eyJ...prod-anon-key...
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY=eyJ...prod-service-role...
PRODUCTION_GOOGLE_PLACES_API_KEY=AIza...  # Optional
PRODUCTION_GOOGLE_PLACE_ID=ChIJ...  # Optional
```

#### Option 2: GitHub Environments (Advanced - Recommended)

GitHub Environments provide deployment protection rules and environment-specific secrets.

**Create Environments**:

1. Go to: **Settings → Environments**
2. Click **"New environment"**

**Staging Environment**:
- Name: `staging`
- Protection rules: None (auto-deploy from develop)
- Secrets:
  ```
  SUPABASE_URL=https://staging-xxx.supabase.co
  SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  GOOGLE_PLACES_API_KEY=AIza...
  GOOGLE_PLACE_ID=ChIJ...
  ```

**Production Environment**:
- Name: `production`
- Protection rules:
  - ✅ Required reviewers: Add yourself or team
  - ✅ Wait timer: 0 minutes (or add delay)
  - ✅ Deployment branches: Only `main` branch
- Secrets:
  ```
  SUPABASE_URL=https://prod-xxx.supabase.co
  SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  GOOGLE_PLACES_API_KEY=AIza...
  GOOGLE_PLACE_ID=ChIJ...
  ```

### GCP Secret Manager Setup

Create secrets for each environment:

```bash
# Set project
gcloud config set project clinica-ferreira-borges

# Create staging secrets
gcloud secrets create staging-supabase-url \
  --replication-policy="automatic" \
  --data-file=- <<< "https://staging-xxx.supabase.co"

gcloud secrets create staging-supabase-anon-key \
  --replication-policy="automatic" \
  --data-file=- <<< "eyJ...staging-anon..."

gcloud secrets create staging-supabase-service-role-key \
  --replication-policy="automatic" \
  --data-file=- <<< "eyJ...staging-service-role..."

# Create production secrets
gcloud secrets create production-supabase-url \
  --replication-policy="automatic" \
  --data-file=- <<< "https://prod-xxx.supabase.co"

gcloud secrets create production-supabase-anon-key \
  --replication-policy="automatic" \
  --data-file=- <<< "eyJ...prod-anon..."

gcloud secrets create production-supabase-service-role-key \
  --replication-policy="automatic" \
  --data-file=- <<< "eyJ...prod-service-role..."

# Optional: Google Places API (if different per environment)
gcloud secrets create staging-google-places-api-key \
  --replication-policy="automatic" \
  --data-file=- <<< "AIza...staging..."

gcloud secrets create production-google-places-api-key \
  --replication-policy="automatic" \
  --data-file=- <<< "AIza...production..."
```

### Grant Service Account Access

```bash
# Get service account email
SERVICE_ACCOUNT="github-actions-deployer@clinica-ferreira-borges.iam.gserviceaccount.com"

# Grant access to all secrets
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
    --role="roles/secretmanager.secretAccessor"
done
```

---

## CI/CD Integration

### Update GitHub Actions Workflow

Modify [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) to support multi-environment deployments:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main        # Production
      - develop     # Staging
  pull_request:
    branches:
      - main
      - develop

env:
  PROJECT_ID: ${{ secrets.GOOGLE_PROJECT_ID }}

jobs:
  # Stage 1: Lint and Type Check
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript type check
        run: npx tsc --noEmit

  # Stage 2: Build Application
  build:
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        environment:
          - ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Create .env file for build
        run: |
          if [ "${{ matrix.environment }}" == "production" ]; then
            echo "SUPABASE_URL=${{ secrets.PRODUCTION_SUPABASE_URL }}" >> .env.production
            echo "SUPABASE_ANON_KEY=${{ secrets.PRODUCTION_SUPABASE_ANON_KEY }}" >> .env.production
            echo "SUPABASE_SERVICE_ROLE_KEY=${{ secrets.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY }}" >> .env.production
            echo "GOOGLE_PLACES_API_KEY=${{ secrets.PRODUCTION_GOOGLE_PLACES_API_KEY }}" >> .env.production
            echo "GOOGLE_PLACE_ID=${{ secrets.PRODUCTION_GOOGLE_PLACE_ID }}" >> .env.production
          else
            echo "SUPABASE_URL=${{ secrets.STAGING_SUPABASE_URL }}" >> .env.production
            echo "SUPABASE_ANON_KEY=${{ secrets.STAGING_SUPABASE_ANON_KEY }}" >> .env.production
            echo "SUPABASE_SERVICE_ROLE_KEY=${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}" >> .env.production
            echo "GOOGLE_PLACES_API_KEY=${{ secrets.STAGING_GOOGLE_PLACES_API_KEY }}" >> .env.production
            echo "GOOGLE_PLACE_ID=${{ secrets.STAGING_GOOGLE_PLACE_ID }}" >> .env.production
          fi

      - name: Build Next.js application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.environment }}
          path: .next

  # Stage 3: Route Tests
  test:
    runs-on: ubuntu-latest
    needs: build
    strategy:
      matrix:
        environment:
          - ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-${{ matrix.environment }}
          path: .next

      - name: Start application
        run: |
          if [ "${{ matrix.environment }}" == "production" ]; then
            SUPABASE_URL="${{ secrets.PRODUCTION_SUPABASE_URL }}" \
            SUPABASE_ANON_KEY="${{ secrets.PRODUCTION_SUPABASE_ANON_KEY }}" \
            SUPABASE_SERVICE_ROLE_KEY="${{ secrets.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY }}" \
            npm start &
          else
            SUPABASE_URL="${{ secrets.STAGING_SUPABASE_URL }}" \
            SUPABASE_ANON_KEY="${{ secrets.STAGING_SUPABASE_ANON_KEY }}" \
            SUPABASE_SERVICE_ROLE_KEY="${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}" \
            npm start &
          fi

          # Wait for server to start
          sleep 10

      - name: Run route tests
        run: TEST_BASE_URL=http://localhost:3000 npm run test:routes

  # Stage 4: Docker Build & Push
  docker:
    runs-on: ubuntu-latest
    needs: test
    strategy:
      matrix:
        environment:
          - ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker

      - name: Build and Push Docker Image
        run: |
          # Determine image tag
          if [ "${{ matrix.environment }}" == "production" ]; then
            IMAGE_TAG="gcr.io/${{ env.PROJECT_ID }}/cfb-website:${{ github.sha }}"
            IMAGE_LATEST="gcr.io/${{ env.PROJECT_ID }}/cfb-website:latest"
            SUPABASE_URL="${{ secrets.PRODUCTION_SUPABASE_URL }}"
            SUPABASE_ANON_KEY="${{ secrets.PRODUCTION_SUPABASE_ANON_KEY }}"
            SUPABASE_SERVICE_ROLE_KEY="${{ secrets.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY }}"
            GOOGLE_PLACES_API_KEY="${{ secrets.PRODUCTION_GOOGLE_PLACES_API_KEY }}"
            GOOGLE_PLACE_ID="${{ secrets.PRODUCTION_GOOGLE_PLACE_ID }}"
          else
            IMAGE_TAG="gcr.io/${{ env.PROJECT_ID }}/cfb-website:staging-${{ github.sha }}"
            IMAGE_LATEST="gcr.io/${{ env.PROJECT_ID }}/cfb-website:staging-latest"
            SUPABASE_URL="${{ secrets.STAGING_SUPABASE_URL }}"
            SUPABASE_ANON_KEY="${{ secrets.STAGING_SUPABASE_ANON_KEY }}"
            SUPABASE_SERVICE_ROLE_KEY="${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}"
            GOOGLE_PLACES_API_KEY="${{ secrets.STAGING_GOOGLE_PLACES_API_KEY }}"
            GOOGLE_PLACE_ID="${{ secrets.STAGING_GOOGLE_PLACE_ID }}"
          fi

          # Build image
          docker build \
            --build-arg SUPABASE_URL="${SUPABASE_URL}" \
            --build-arg SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" \
            --build-arg SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}" \
            --build-arg GOOGLE_PLACES_API_KEY="${GOOGLE_PLACES_API_KEY}" \
            --build-arg GOOGLE_PLACE_ID="${GOOGLE_PLACE_ID}" \
            -t ${IMAGE_TAG} \
            -t ${IMAGE_LATEST} \
            .

          # Push images
          docker push ${IMAGE_TAG}
          docker push ${IMAGE_LATEST}

          # Save image tag for deployment
          echo "IMAGE_TAG=${IMAGE_TAG}" >> $GITHUB_ENV

  # Stage 5: Deploy to Cloud Run
  deploy:
    runs-on: ubuntu-latest
    needs: docker
    strategy:
      matrix:
        environment:
          - ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    environment: ${{ matrix.environment }}  # Use GitHub Environments

    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        run: |
          # Determine service name and secrets
          if [ "${{ matrix.environment }}" == "production" ]; then
            SERVICE_NAME="cfb-website-production"
            IMAGE_TAG="gcr.io/${{ env.PROJECT_ID }}/cfb-website:${{ github.sha }}"
            SECRET_PREFIX="production"
          else
            SERVICE_NAME="cfb-website-staging"
            IMAGE_TAG="gcr.io/${{ env.PROJECT_ID }}/cfb-website:staging-${{ github.sha }}"
            SECRET_PREFIX="staging"
          fi

          # Deploy
          gcloud run deploy ${SERVICE_NAME} \
            --image=${IMAGE_TAG} \
            --platform=managed \
            --region=europe-west1 \
            --allow-unauthenticated \
            --set-secrets="SUPABASE_URL=${SECRET_PREFIX}-supabase-url:latest,SUPABASE_ANON_KEY=${SECRET_PREFIX}-supabase-anon-key:latest,SUPABASE_SERVICE_ROLE_KEY=${SECRET_PREFIX}-supabase-service-role-key:latest,GOOGLE_PLACES_API_KEY=${SECRET_PREFIX}-google-places-api-key:latest,GOOGLE_PLACE_ID=${SECRET_PREFIX}-google-place-id:latest" \
            --min-instances=0 \
            --max-instances=10 \
            --memory=512Mi \
            --cpu=1 \
            --timeout=60 \
            --concurrency=80 \
            --port=3000

          # Get service URL
          SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
            --platform=managed \
            --region=europe-west1 \
            --format='value(status.url)')

          echo "Deployed to: ${SERVICE_URL}"
          echo "SERVICE_URL=${SERVICE_URL}" >> $GITHUB_ENV

  # Stage 6: Smoke Tests
  smoke-test:
    runs-on: ubuntu-latest
    needs: deploy
    strategy:
      matrix:
        environment:
          - ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - name: Get Service URL
        run: |
          if [ "${{ matrix.environment }}" == "production" ]; then
            SERVICE_NAME="cfb-website-production"
          else
            SERVICE_NAME="cfb-website-staging"
          fi

          SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
            --platform=managed \
            --region=europe-west1 \
            --format='value(status.url)')

          echo "SERVICE_URL=${SERVICE_URL}" >> $GITHUB_ENV

      - name: Test Homepage
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL}/)
          if [ "$response" != "200" ]; then
            echo "Homepage test failed with status: $response"
            exit 1
          fi

      - name: Test API Health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL}/api/settings)
          if [ "$response" != "200" ]; then
            echo "API health test failed with status: $response"
            exit 1
          fi

      - name: Test Admin Login Page
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL}/admin/login)
          if [ "$response" != "200" ]; then
            echo "Admin login test failed with status: $response"
            exit 1
          fi
```

---

## Deployment Workflow

### Development → Staging

1. **Develop Features**:
   ```bash
   git checkout develop
   git pull origin develop

   # Create feature branch
   git checkout -b feature/new-language-support

   # Make changes...
   # Create migrations if needed
   ```

2. **Test Locally**:
   ```bash
   supabase start
   supabase migration up
   npm run dev
   npm run test:routes
   ```

3. **Merge to Develop**:
   ```bash
   git checkout develop
   git merge feature/new-language-support
   git push origin develop
   ```

4. **CI/CD Deploys to Staging**:
   - Lint & type check
   - Build with staging credentials
   - Run route tests
   - Build Docker image (tagged `staging-COMMIT_SHA`)
   - Deploy to `cfb-website-staging` Cloud Run service
   - Run smoke tests

5. **Manual QA on Staging**:
   - Test new features
   - Verify database migrations
   - Check error logs
   - Performance testing

### Staging → Production

1. **Create Pull Request**:
   ```bash
   # Create PR: develop → main
   gh pr create --base main --head develop --title "Release v1.2.0"
   ```

2. **Code Review**:
   - Review changes
   - Verify staging tests passed
   - Check migration files
   - Approve PR

3. **Merge to Main**:
   ```bash
   git checkout main
   git merge develop
   git tag v1.2.0
   git push origin main --tags
   ```

4. **CI/CD Deploys to Production**:
   - Same pipeline as staging
   - Uses production credentials
   - Deploys to `cfb-website-production`
   - Requires manual approval (if GitHub Environment configured)

5. **Monitor Production**:
   - Check Cloud Run logs
   - Monitor error rates
   - Verify user traffic
   - Be ready to rollback if needed

### Rollback Procedure

If production deployment fails:

```bash
# Option 1: Redeploy previous version
gcloud run deploy cfb-website-production \
  --image=gcr.io/clinica-ferreira-borges/cfb-website:PREVIOUS_SHA \
  --platform=managed \
  --region=europe-west1

# Option 2: Revert migrations
supabase link --project-ref [PROD_REF]
supabase db push  # Push rollback migration

# Option 3: Revert Git commit
git revert HEAD
git push origin main  # Triggers new deployment
```

---

## Best Practices

### Database Migrations

✅ **DO**:
- Always test migrations in staging first
- Use idempotent SQL (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- Add indexes for performance
- Include rollback migrations
- Version control all migration files
- Use descriptive migration names

❌ **DON'T**:
- Make schema changes directly in production
- Delete migrations that have been deployed
- Modify existing migration files
- Skip staging validation
- Deploy migrations without backups

### Example: Idempotent Migration

```sql
-- Good: Idempotent
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) NOT NULL UNIQUE,
  value jsonb
);

-- Add column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='settings' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.settings ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Insert with conflict handling
INSERT INTO public.settings (key, value)
VALUES ('site_name', '"Clínica Ferreira Borges"')
ON CONFLICT (key) DO NOTHING;
```

### Credential Security

✅ **DO**:
- Use different credentials for each environment
- Rotate service role keys every 90 days
- Use GCP Secret Manager for Cloud Run
- Never commit credentials to Git
- Use GitHub Environments for protection
- Enable audit logging

❌ **DON'T**:
- Reuse production keys in staging
- Store secrets in environment variables
- Use NEXT_PUBLIC_ for sensitive data
- Share credentials in chat/email
- Use same database password across environments

### Environment Isolation

✅ **DO**:
- Use separate Supabase projects
- Use separate Cloud Run services
- Use separate GCP Secret Manager secrets
- Test thoroughly in staging
- Monitor both environments separately

❌ **DON'T**:
- Share databases between environments
- Point staging to production database
- Test new features directly in production
- Skip staging validation

### Monitoring & Observability

Set up monitoring for each environment:

```bash
# Cloud Run Metrics
- Request count
- Request latency
- Error rate
- Instance count
- Memory usage
- CPU usage

# Supabase Metrics
- Database connections
- Query performance
- RLS policy hits
- Storage usage
- Auth events
```

---

## Troubleshooting

### Migration Fails in Staging

**Symptom**: `supabase db push` fails with SQL error

**Solution**:
```bash
# Check current migration status
supabase migration list --remote

# Check database schema
supabase db diff

# Reset local database and test
supabase db reset
supabase migration up

# Fix migration file
# Re-push
supabase db push
```

### Credentials Not Working in Cloud Run

**Symptom**: Application crashes with "Invalid Supabase credentials"

**Solution**:
```bash
# Verify secrets exist in GCP
gcloud secrets list | grep supabase

# Check secret values
gcloud secrets versions access latest --secret="staging-supabase-url"

# Verify service account has access
gcloud secrets get-iam-policy staging-supabase-url

# Redeploy with correct secrets
gcloud run deploy cfb-website-staging \
  --set-secrets="SUPABASE_URL=staging-supabase-url:latest,..."
```

### Build Fails with "Ambiguous environment"

**Symptom**: CI/CD doesn't know which environment to use

**Solution**:
- Ensure branch names match exactly (`main`, `develop`)
- Check workflow file branch filters
- Verify environment secrets exist

### Staging and Production Have Different Data

**Expected**: This is normal - they should have different data

**To sync production data to staging** (for testing):
```bash
# Export from production
supabase db dump --project-ref [PROD_REF] --password [PROD_PASS] > prod-dump.sql

# Import to staging (CAUTION: Overwrites staging data)
supabase link --project-ref [STAGING_REF]
psql -h db.[STAGING_REF].supabase.co -U postgres -d postgres -f prod-dump.sql
```

**⚠️ Warning**: Be very careful with data dumps. Never import staging data into production.

---

## Quick Reference

### Common Commands

```bash
# Local Development
supabase start                          # Start local Supabase
supabase stop                           # Stop local Supabase
supabase db reset                       # Reset local database
supabase migration new [name]           # Create migration
supabase migration up                   # Apply migrations locally

# Staging
supabase link --project-ref [STAGING_REF]
supabase db push                        # Push migrations to remote
supabase migration list --remote        # Check remote migrations

# Production
supabase link --project-ref [PROD_REF]
supabase db push                        # Push migrations to production

# CI/CD
git push origin develop                 # Deploy to staging
git push origin main                    # Deploy to production

# GCP
gcloud run services list                # List services
gcloud run services describe [SERVICE]  # Get service details
gcloud secrets list                     # List secrets
```

### Migration Checklist

- [ ] Create migration file with descriptive name
- [ ] Write idempotent SQL
- [ ] Include RLS policies
- [ ] Add indexes
- [ ] Test locally (`supabase db reset`)
- [ ] Push to staging (`supabase db push`)
- [ ] Deploy app to staging
- [ ] QA testing in staging
- [ ] Create rollback migration (if complex)
- [ ] Merge to main
- [ ] Push to production
- [ ] Monitor production

### Deployment Checklist

- [ ] All tests passing locally
- [ ] Migrations tested in staging
- [ ] Code reviewed
- [ ] Staging deployment successful
- [ ] Manual QA completed
- [ ] Secrets configured for environment
- [ ] Rollback plan prepared
- [ ] Merge to appropriate branch
- [ ] Monitor CI/CD pipeline
- [ ] Verify deployment
- [ ] Monitor error logs

---

## Next Steps

1. **Create Supabase Projects**: Set up staging and production projects
2. **Configure GitHub Secrets**: Add all environment-specific credentials
3. **Set Up GCP Secret Manager**: Create secrets for Cloud Run
4. **Update CI/CD Workflow**: Implement multi-environment pipeline
5. **Test Staging Deployment**: Push to develop branch
6. **Test Production Deployment**: Push to main branch
7. **Set Up Monitoring**: Configure Cloud Run and Supabase alerts

---

## Support Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GCP Secret Manager](https://cloud.google.com/secret-manager/docs)

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
