#!/bin/bash
# Setup Google Artifact Registry (GCR replacement)

set -e

PROJECT_ID="clinica-ferreira-borges"
REGION="europe-west1"
REPOSITORY="cfb-website"

echo "🔧 Setting up Google Artifact Registry..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Repository: $REPOSITORY"
echo ""

# Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPOSITORY \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker images for CFB website (staging and production)" \
  --project=$PROJECT_ID \
  2>/dev/null || echo "Repository already exists (OK)"

# Configure Docker authentication
echo "🔐 Configuring Docker authentication for Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

echo ""
echo "✅ Artifact Registry setup complete!"
echo ""
echo "📝 Repository details:"
gcloud artifacts repositories describe $REPOSITORY \
  --location=$REGION \
  --project=$PROJECT_ID

echo ""
echo "🎯 Your new registry URL:"
echo "   ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}"
echo ""
echo "📋 Next steps:"
echo "   1. Update .github/workflows/ci-cd.yml to use new registry"
echo "   2. Push changes to trigger new deployment"
echo ""
