#!/bin/bash

# Consolidate Supabase Migrations Script
# This script moves all migrations from migrations.old to migrations folder

set -e

echo "🔄 Starting migration consolidation..."

# Check if migrations.old exists
if [ ! -d "supabase/migrations.old" ]; then
  echo "❌ Error: supabase/migrations.old directory not found"
  exit 1
fi

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Count existing migrations in both directories
OLD_COUNT=$(ls -1 supabase/migrations.old/*.sql 2>/dev/null | wc -l)
CURRENT_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)

echo "📊 Found $OLD_COUNT migration(s) in migrations.old/"
echo "📊 Found $CURRENT_COUNT migration(s) in migrations/"

# Back up current migrations if they exist
if [ $CURRENT_COUNT -gt 0 ]; then
  echo "💾 Backing up current migrations..."
  mkdir -p supabase/migrations.backup
  cp supabase/migrations/*.sql supabase/migrations.backup/ 2>/dev/null || true
fi

# Copy all migrations from .old to main directory
echo "📦 Copying migrations from migrations.old to migrations..."
cp supabase/migrations.old/*.sql supabase/migrations/

# Count final migrations
FINAL_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo "✅ Consolidation complete! Total migrations: $FINAL_COUNT"

# List all migrations in chronological order
echo ""
echo "📋 Migration files (in order):"
ls -1 supabase/migrations/*.sql | sort

echo ""
echo "✨ Ready to reset database with: npx supabase db reset"
