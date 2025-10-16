#!/usr/bin/env node
/**
 * Comprehensive Route Testing Harness
 *
 * Tests all application routes to ensure they return expected status codes
 * Usage: node scripts/test-routes.mjs
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3002';

// Define all routes to test
const routes = [
  // Public Frontend Routes
  { path: '/', method: 'GET', expectedStatus: 200, description: 'Homepage (Portuguese)', category: 'Frontend - Public' },
  { path: '/pt', method: 'GET', expectedStatus: 307, description: 'Homepage (explicit PT - redirects to /)', category: 'Frontend - Public' },
  { path: '/en', method: 'GET', expectedStatus: 200, description: 'Homepage (English)', category: 'Frontend - Public' },
  { path: '/pt/contacto', method: 'GET', expectedStatus: 307, description: 'Contact page (PT - redirects to /contacto)', category: 'Frontend - Public' },
  { path: '/en/contacto', method: 'GET', expectedStatus: 200, description: 'Contact page (EN)', category: 'Frontend - Public' },
  { path: '/pt/equipa', method: 'GET', expectedStatus: 307, description: 'Team page (PT - redirects to /equipa)', category: 'Frontend - Public' },
  { path: '/en/equipa', method: 'GET', expectedStatus: 200, description: 'Team page (EN)', category: 'Frontend - Public' },
  { path: '/pt/tecnologia', method: 'GET', expectedStatus: 307, description: 'Technology page (PT - redirects to /tecnologia)', category: 'Frontend - Public' },
  { path: '/en/tecnologia', method: 'GET', expectedStatus: 200, description: 'Technology page (EN)', category: 'Frontend - Public' },
  { path: '/pt/pagamentos', method: 'GET', expectedStatus: 307, description: 'Payments page (PT - redirects to /pagamentos)', category: 'Frontend - Public' },
  { path: '/en/pagamentos', method: 'GET', expectedStatus: 200, description: 'Payments page (EN)', category: 'Frontend - Public' },
  { path: '/pt/termos-condicoes', method: 'GET', expectedStatus: 307, description: 'Terms & Conditions (PT - redirects to /termos-condicoes)', category: 'Frontend - Public' },
  { path: '/en/termos-condicoes', method: 'GET', expectedStatus: 200, description: 'Terms & Conditions (EN)', category: 'Frontend - Public' },

  // Admin Routes - Public
  { path: '/admin/login', method: 'GET', expectedStatus: 200, description: 'Admin login page', category: 'Admin - Public' },

  // Admin Routes - Protected (will return 307/401 if not authenticated)
  { path: '/admin', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Admin dashboard', category: 'Admin - Protected' },
  { path: '/admin/treatments', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Treatments list', category: 'Admin - Protected' },
  { path: '/admin/team', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Team members list', category: 'Admin - Protected' },
  { path: '/admin/faqs', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'FAQs list', category: 'Admin - Protected' },
  { path: '/admin/submissions', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Form submissions list', category: 'Admin - Protected' },
  { path: '/admin/content', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Content management', category: 'Admin - Protected' },

  // Admin Settings Routes
  { path: '/admin/settings', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Settings overview', category: 'Admin - Settings' },
  { path: '/admin/settings/clinic', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Clinic settings', category: 'Admin - Settings' },
  { path: '/admin/settings/contact', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Contact information settings', category: 'Admin - Settings' },
  { path: '/admin/settings/languages', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Language management', category: 'Admin - Settings' },
  { path: '/admin/settings/insurance', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Insurance providers settings', category: 'Admin - Settings' },
  { path: '/admin/settings/payments', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Payment options settings', category: 'Admin - Settings' },
  { path: '/admin/settings/social', method: 'GET', expectedStatus: 200, requiresAuth: true, description: 'Social media settings', category: 'Admin - Settings' },

  // API Routes - Public
  { path: '/api/treatments', method: 'GET', expectedStatus: 200, description: 'Get treatments', category: 'API - Public' },
  { path: '/api/team', method: 'GET', expectedStatus: 200, description: 'Get team members', category: 'API - Public' },
  { path: '/api/settings', method: 'GET', expectedStatus: 200, description: 'Get clinic settings', category: 'API - Public' },
  { path: '/api/google-reviews', method: 'GET', expectedStatus: 200, description: 'Get Google reviews', category: 'API - Public' },
  { path: '/api/insurance', method: 'GET', expectedStatus: 200, description: 'Get insurance providers', category: 'API - Public' },
  { path: '/api/financing', method: 'GET', expectedStatus: 200, description: 'Get financing options', category: 'API - Public' },
  { path: '/api/prices', method: 'GET', expectedStatus: 200, description: 'Get prices', category: 'API - Public' },
  { path: '/api/social-media', method: 'GET', expectedStatus: 200, description: 'Get social media links', category: 'API - Public' },
  { path: '/api/hero-sections', method: 'GET', expectedStatus: 200, description: 'Get hero sections', category: 'API - Public' },
  { path: '/api/cta-sections', method: 'GET', expectedStatus: 200, description: 'Get CTA sections', category: 'API - Public' },

  // API Routes - Admin (require authentication)
  // Note: Admin API routes now require authentication and return 401 when not authenticated
  // The following routes are write-only (POST/PUT/DELETE) and don't support GET:
  // - /api/admin/faqs (POST, PUT, DELETE only)
  // - /api/admin/submissions (PUT, DELETE only)
  // - /api/admin/clinic-settings (PUT only)
  // - /api/admin/settings/contact (POST, PUT, DELETE only)
  { path: '/api/admin/languages', method: 'GET', expectedStatus: 401, requiresAuth: true, description: 'Get languages (requires auth)', category: 'API - Admin' },
];

async function testRoute(route) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${route.path}`, {
      method: route.method,
      redirect: 'manual', // Don't follow redirects automatically
    });

    const responseTime = Date.now() - startTime;
    const actualStatus = response.status;

    // For protected routes without auth, we expect 307 (redirect) or 401 (unauthorized)
    let passed = actualStatus === route.expectedStatus;

    if (route.requiresAuth && (actualStatus === 307 || actualStatus === 401 || actualStatus === 303)) {
      passed = true; // It's OK to redirect/unauthorized when not logged in
    }

    return {
      path: route.path,
      method: route.method,
      expectedStatus: route.expectedStatus,
      actualStatus,
      passed,
      responseTime,
      description: route.description,
      category: route.category,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      path: route.path,
      method: route.method,
      expectedStatus: route.expectedStatus,
      actualStatus: 0,
      passed: false,
      error: error.message,
      responseTime,
      description: route.description,
      category: route.category,
    };
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Route Testing\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('─'.repeat(120));

  const results = [];

  // Test routes sequentially to avoid overwhelming the server
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);

    const statusIcon = result.passed ? '✅' : '❌';
    const statusText = result.error
      ? `ERROR: ${result.error}`
      : `${result.actualStatus} (expected ${result.expectedStatus})`;

    console.log(`${statusIcon} ${result.method.padEnd(6)} ${result.path.padEnd(50)} ${statusText.padEnd(30)} ${result.responseTime}ms`);
  }

  console.log('\n' + '─'.repeat(120));

  // Group results by category
  const categories = Array.from(new Set(results.map(r => r.category)));

  console.log('\n📊 Results Summary by Category:\n');

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const total = categoryResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);

    const icon = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
    console.log(`${icon} ${category.padEnd(30)} ${passed}/${total} (${percentage}%)`);
  }

  // Overall summary
  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log('\n' + '─'.repeat(120));
  console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)\n`);

  // List failed tests
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('❌ Failed Tests:\n');
    for (const test of failedTests) {
      console.log(`   ${test.method} ${test.path}`);
      console.log(`   Expected: ${test.expectedStatus}, Got: ${test.actualStatus}`);
      console.log(`   Description: ${test.description}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
      console.log();
    }
  }

  // Calculate average response time
  const avgResponseTime = (results.reduce((sum, r) => sum + r.responseTime, 0) / results.length).toFixed(0);
  console.log(`⚡ Average response time: ${avgResponseTime}ms\n`);

  // Exit with error code if any tests failed
  if (failedTests.length > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
