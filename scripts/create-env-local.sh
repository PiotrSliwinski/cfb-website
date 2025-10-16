#!/bin/bash

# Script to create .env.local from GitHub Staging environment secrets
# Note: You need to manually paste the secret values when prompted

echo "Creating .env.local file with Staging environment configuration..."
echo ""
echo "Please provide the following values from:"
echo "1. GitHub Secrets (Settings → Secrets → Environment secrets → Staging)"
echo "2. Or Supabase Dashboard (https://supabase.com/dashboard → Your Project → Settings → API)"
echo ""

read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "GOOGLE_PLACES_API_KEY: " GOOGLE_PLACES_API_KEY
read -p "GOOGLE_PLACE_ID: " GOOGLE_PLACE_ID

cat > .env.local <<EOF
# Supabase Configuration - Staging Environment
# Connected to: https://hkrpefnergidmviuewkt.supabase.co
SUPABASE_URL=https://hkrpefnergidmviuewkt.supabase.co
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Google Places API
GOOGLE_PLACES_API_KEY=${GOOGLE_PLACES_API_KEY}
GOOGLE_PLACE_ID=${GOOGLE_PLACE_ID}
EOF

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "To start the dev server:"
echo "  npm run dev"
echo ""
echo "The server will connect to your staging Supabase instance."
