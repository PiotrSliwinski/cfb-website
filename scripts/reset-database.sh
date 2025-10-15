#!/bin/bash

# Reset Supabase Database Script
# This script resets the database and re-runs all migrations

set -e

echo "🗄️  Resetting Supabase database..."
echo "⚠️  This will drop all tables and re-run all migrations"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

# Check if Supabase is running
if ! npx supabase status > /dev/null 2>&1; then
  echo "🚀 Starting Supabase..."
  npx supabase start
  echo ""
fi

# Confirm reset
read -p "Are you sure you want to reset the database? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Reset cancelled"
  exit 0
fi

echo ""
echo "🔄 Resetting database..."
npx supabase db reset

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📊 Checking database status..."
npx supabase status

echo ""
echo "✨ Database is ready!"
echo "   - API URL: http://127.0.0.1:54321"
echo "   - Studio: http://127.0.0.1:54323"
echo "   - Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
