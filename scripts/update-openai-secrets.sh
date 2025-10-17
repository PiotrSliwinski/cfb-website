#!/bin/bash
# =============================================================================
# Update OpenAI API Key in Google Cloud Secret Manager
# =============================================================================
# This script updates the OpenAI API key in Google Cloud Secret Manager
# for both staging and production environments.
#
# Usage:
#   ./scripts/update-openai-secrets.sh [staging|production|both]
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Appropriate permissions to manage secrets in GCP
#   - Project ID configured in gcloud
#
# OpenAI Project Details:
#   - Project Name: CFB-WEBSITE
#   - Project ID: proj_6M28GQHCZwB7fi34zUgWRLW2
#   - API Key Name: CFB-WEBSITE
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# OpenAI API key value
# Provide via OPENAI_API_KEY environment variable or secure prompt
OPENAI_API_KEY="${OPENAI_API_KEY:-}"

# Prompt securely if not provided
if [ -z "$OPENAI_API_KEY" ]; then
  echo -n "Enter OpenAI API key: "
  read -r -s OPENAI_API_KEY
  echo ""
fi

if [[ ! "$OPENAI_API_KEY" =~ ^sk-[[:alnum:]_=-]+$ ]]; then
  echo -e "${RED}Error: OPENAI_API_KEY is missing or invalid${NC}"
  exit 1
fi

# Default environment
ENVIRONMENT="${1:-both}"

# Validate input
if [[ ! "$ENVIRONMENT" =~ ^(staging|production|both)$ ]]; then
  echo -e "${RED}Error: Invalid environment. Use 'staging', 'production', or 'both'${NC}"
  echo "Usage: $0 [staging|production|both]"
  exit 1
fi

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}OpenAI API Key Update Script${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}OpenAI Project Information:${NC}"
echo "  Project Name: CFB-WEBSITE"
echo "  Project ID: proj_6M28GQHCZwB7fi34zUgWRLW2"
echo "  Key Name: CFB-WEBSITE"
echo ""
echo -e "${YELLOW}Target Environment: ${ENVIRONMENT}${NC}"
echo ""

# Get current GCP project
GCP_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$GCP_PROJECT" ]; then
  echo -e "${RED}Error: No GCP project configured${NC}"
  echo "Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo -e "${GREEN}Using GCP Project: ${GCP_PROJECT}${NC}"
echo ""

# Function to update a secret
update_secret() {
  local SECRET_NAME=$1
  local SECRET_VALUE=$2
  local ENV_LABEL=$3

  echo -e "${BLUE}Updating secret: ${SECRET_NAME}${NC}"

  # Check if secret exists
  if gcloud secrets describe "$SECRET_NAME" --project="$GCP_PROJECT" &>/dev/null; then
    echo "  Secret exists, adding new version..."
    echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
      --project="$GCP_PROJECT" \
      --data-file=- \
      2>&1 | sed 's/^/  /'
  else
    echo "  Secret does not exist, creating..."
    echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
      --project="$GCP_PROJECT" \
      --replication-policy="automatic" \
      --labels="environment=$ENV_LABEL,service=cfb-website,type=api-key,provider=openai" \
      --data-file=- \
      2>&1 | sed 's/^/  /'
  fi

  if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ Successfully updated ${SECRET_NAME}${NC}"
  else
    echo -e "  ${RED}✗ Failed to update ${SECRET_NAME}${NC}"
    return 1
  fi
  echo ""
}

# Function to grant Cloud Run access to secret
grant_cloud_run_access() {
  local SECRET_NAME=$1
  local SERVICE_ACCOUNT_EMAIL=$2

  echo -e "${BLUE}Granting Cloud Run access to ${SECRET_NAME}${NC}"

  gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --project="$GCP_PROJECT" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    2>&1 | sed 's/^/  /'

  if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ Access granted${NC}"
  else
    echo -e "  ${YELLOW}⚠ Warning: Could not grant access (may already exist)${NC}"
  fi
  echo ""
}

# Update staging secrets
if [[ "$ENVIRONMENT" == "staging" || "$ENVIRONMENT" == "both" ]]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}STAGING ENVIRONMENT${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  update_secret "openai-api-key-staging" "$OPENAI_API_KEY" "staging"

  # Try to grant access to the Cloud Run service account
  # Note: This assumes the default compute service account
  # Adjust if you're using a custom service account
  COMPUTE_SA="${GCP_PROJECT}-compute@developer.gserviceaccount.com"
  echo -e "${BLUE}Note: If Cloud Run uses a different service account, update manually${NC}"
  grant_cloud_run_access "openai-api-key-staging" "$COMPUTE_SA"
fi

# Update production secrets
if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "both" ]]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}PRODUCTION ENVIRONMENT${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  update_secret "openai-api-key-production" "$OPENAI_API_KEY" "production"

  # Try to grant access to the Cloud Run service account
  COMPUTE_SA="${GCP_PROJECT}-compute@developer.gserviceaccount.com"
  echo -e "${BLUE}Note: If Cloud Run uses a different service account, update manually${NC}"
  grant_cloud_run_access "openai-api-key-production" "$COMPUTE_SA"
fi

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}✓ OpenAI API Key Update Complete${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Verify secrets in GCP Console:"
echo "   https://console.cloud.google.com/security/secret-manager?project=$GCP_PROJECT"
echo ""
echo "2. Update GitHub Environment Secrets (if needed):"
echo "   - Go to: https://github.com/YOUR_ORG/cfb-website/settings/environments"
echo "   - Staging Environment → Add secret: OPENAI_API_KEY"
echo "   - Production Environment → Add secret: OPENAI_API_KEY"
echo ""
echo "3. Restart Cloud Run services to pick up new secrets:"
if [[ "$ENVIRONMENT" == "staging" || "$ENVIRONMENT" == "both" ]]; then
  echo "   gcloud run services update cfb-website-staging --region=europe-west1 --project=$GCP_PROJECT"
fi
if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "both" ]]; then
  echo "   gcloud run services update cfb-website --region=europe-west1 --project=$GCP_PROJECT"
fi
echo ""
echo -e "${YELLOW}Note: The secrets are configured to be injected at Cloud Run runtime.${NC}"
echo -e "${YELLOW}The next deployment will automatically use the updated secrets.${NC}"
echo ""
