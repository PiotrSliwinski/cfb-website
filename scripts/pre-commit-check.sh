#!/bin/bash
# Pre-commit check script
# Catches common build issues before pushing to CI/CD

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
CHECKS_PASSED=true

# Function to print check status
print_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${RED}✗${NC} $2"
    CHECKS_PASSED=false
  fi
}

# Check 1: Lint
echo "📝 Running ESLint..."
if npm run lint > /dev/null 2>&1; then
  print_status 0 "Linting passed"
else
  print_status 1 "Linting failed"
  echo "   Run 'npm run lint' to see details"
fi
echo ""

# Check 2: TypeScript type checking
echo "🔧 Running TypeScript type check..."
if npx tsc --noEmit > /dev/null 2>&1; then
  print_status 0 "Type checking passed"
else
  print_status 1 "Type checking failed"
  echo "   Run 'npx tsc --noEmit' to see details"
fi
echo ""

# Check 3: Build (with dummy env vars to avoid build-time failures)
echo "🏗️  Testing production build..."
export OPENAI_API_KEY="test_key_for_build"
export GOOGLE_PLACES_API_KEY="test_key_for_build"
export GOOGLE_PLACE_ID="test_place_id"

if npm run build > /dev/null 2>&1; then
  print_status 0 "Build succeeded"
else
  print_status 1 "Build failed"
  echo "   Run 'npm run build' to see details"
fi
echo ""

# Check 4: Check for common issues
echo "🔎 Checking for common issues..."

# Check for merge conflict markers
if grep -r "<<<<<<< HEAD" src/ 2>/dev/null; then
  print_status 1 "Merge conflict markers found"
  echo "   Resolve conflicts before committing"
else
  print_status 0 "No merge conflict markers"
fi

# Check for console.log in production code (warning only)
CONSOLE_LOGS=$(grep -r "console\.log" src/ 2>/dev/null | grep -v "console\.error" | grep -v "console\.warn" | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠${NC}  Found $CONSOLE_LOGS console.log statements (consider removing for production)"
else
  print_status 0 "No console.log statements"
fi

# Check for TODO comments (warning only)
TODO_COUNT=$(grep -r "TODO" src/ 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}ℹ${NC}  Found $TODO_COUNT TODO comments"
else
  print_status 0 "No TODO comments"
fi

echo ""
echo "=================================================="

# Final result
if [ "$CHECKS_PASSED" = true ]; then
  echo -e "${GREEN}✓ All checks passed!${NC} Ready to commit."
  exit 0
else
  echo -e "${RED}✗ Some checks failed.${NC} Please fix issues before committing."
  echo ""
  echo "To see detailed errors, run:"
  echo "  npm run lint"
  echo "  npx tsc --noEmit"
  echo "  npm run build"
  exit 1
fi
