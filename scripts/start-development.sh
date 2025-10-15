#!/bin/bash

# Start Development Environment
# This script starts Docker, Supabase, and Next.js dev server

set -e

echo "🚀 Starting development environment..."
echo ""

# Function to check if Docker is running
check_docker() {
  if docker info > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Check Docker
echo "1️⃣ Checking Docker..."
if check_docker; then
  echo "   ✅ Docker is running"
else
  echo "   ⚠️  Docker is not running"
  echo "   Please start Docker Desktop manually"
  echo ""
  read -p "Press Enter after Docker is started..."

  # Wait for Docker to be ready
  echo "   Waiting for Docker..."
  for i in {1..30}; do
    if check_docker; then
      echo "   ✅ Docker is now running"
      break
    fi
    sleep 1
  done

  if ! check_docker; then
    echo "   ❌ Docker failed to start"
    exit 1
  fi
fi

echo ""
echo "2️⃣ Starting Supabase..."
if npx supabase status > /dev/null 2>&1; then
  echo "   ✅ Supabase is already running"
else
  npx supabase start
  echo "   ✅ Supabase started"
fi

echo ""
echo "3️⃣ Getting Supabase connection info..."
npx supabase status

echo ""
echo "✨ Development environment ready!"
echo ""
echo "📝 Next steps:"
echo "   - Open Supabase Studio: http://127.0.0.1:54323"
echo "   - Start Next.js: npm run dev"
echo "   - View website: http://localhost:3000"
echo ""
