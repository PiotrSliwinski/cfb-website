/**
 * Testing utilities and mock data factories
 * Provides reusable test helpers for unit and integration testing
 */

import type {
  Treatment,
  TreatmentTranslation,
  TeamMember,
  TeamMemberTranslation,
  FAQ,
  FAQTranslation,
  Locale,
  UUID,
} from '@/types';

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock UUID for testing
 */
export function createMockUUID(): UUID {
  return '00000000-0000-0000-0000-000000000000' as UUID;
}

/**
 * Creates a mock treatment for testing
 */
export function createMockTreatment(overrides?: Partial<Treatment>): Treatment {
  return {
    id: createMockUUID(),
    slug: 'test-treatment',
    category: 'general',
    icon_url: 'https://example.com/icon.svg',
    hero_image_url: 'https://example.com/hero.jpg',
    display_order: 0,
    is_featured: false,
    is_published: true,
    duration_minutes: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    treatment_translations: [createMockTreatmentTranslation()],
    ...overrides,
  };
}

/**
 * Creates a mock treatment translation for testing
 */
export function createMockTreatmentTranslation(
  overrides?: Partial<TreatmentTranslation>
): TreatmentTranslation {
  return {
    id: createMockUUID(),
    treatment_id: createMockUUID(),
    language_code: 'pt' as Locale,
    title: 'Test Treatment',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    benefits: ['Benefit 1', 'Benefit 2'],
    process_steps: ['Step 1', 'Step 2'],
    faqs: [],
    meta_title: 'Test Meta Title',
    meta_description: 'Test Meta Description',
    ...overrides,
  };
}

/**
 * Creates a mock team member for testing
 */
export function createMockTeamMember(overrides?: Partial<TeamMember>): TeamMember {
  return {
    id: createMockUUID(),
    slug: 'test-member',
    photo_url: 'https://example.com/photo.jpg',
    display_order: 0,
    email: 'test@example.com',
    phone: '+351 999 999 999',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team_member_translations: [createMockTeamMemberTranslation()],
    specialties: [],
    ...overrides,
  };
}

/**
 * Creates a mock team member translation for testing
 */
export function createMockTeamMemberTranslation(
  overrides?: Partial<TeamMemberTranslation>
): TeamMemberTranslation {
  return {
    id: createMockUUID(),
    member_id: createMockUUID(),
    language_code: 'pt' as Locale,
    name: 'Test Member',
    title: 'Test Title',
    bio: 'Test Bio',
    education: ['Education 1'],
    certifications: ['Cert 1'],
    ...overrides,
  };
}

/**
 * Creates a mock FAQ for testing
 */
export function createMockFAQ(overrides?: Partial<FAQ>): FAQ {
  return {
    id: createMockUUID(),
    treatment_id: createMockUUID(),
    display_order: 0,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    faq_translations: [createMockFAQTranslation()],
    ...overrides,
  };
}

/**
 * Creates a mock FAQ translation for testing
 */
export function createMockFAQTranslation(
  overrides?: Partial<FAQTranslation>
): FAQTranslation {
  return {
    id: createMockUUID(),
    faq_id: createMockUUID(),
    language_code: 'pt' as Locale,
    question: 'Test Question?',
    answer: 'Test Answer',
    ...overrides,
  };
}

// ============================================================================
// API Response Mocks
// ============================================================================

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

/**
 * Creates an error API response
 */
export function createErrorResponse(error: string, message?: string) {
  return {
    success: false,
    error,
    message,
  };
}

// ============================================================================
// Test Helpers for Server Actions
// ============================================================================

/**
 * Wrapper for testing server actions
 * Catches errors and returns them in a consistent format
 */
export async function testServerAction<T>(
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Asserts that a server action succeeds
 */
export async function assertActionSuccess<T>(
  action: () => Promise<T>
): Promise<T> {
  const result = await testServerAction(action);
  if (!result.success) {
    throw new Error(`Action failed: ${result.error}`);
  }
  return result.data as T;
}

/**
 * Asserts that a server action fails
 */
export async function assertActionFailure(
  action: () => Promise<any>
): Promise<string> {
  const result = await testServerAction(action);
  if (result.success) {
    throw new Error('Expected action to fail, but it succeeded');
  }
  return result.error!;
}

// ============================================================================
// API Testing Helpers
// ============================================================================

/**
 * Fetches from an API route and returns parsed JSON
 */
export async function testAPIRoute<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`http://localhost:3000${path}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Tests a GET request to an API route
 */
export async function testGET<T>(path: string): Promise<T> {
  return testAPIRoute<T>(path, { method: 'GET' });
}

/**
 * Tests a POST request to an API route
 */
export async function testPOST<T>(path: string, body: any): Promise<T> {
  return testAPIRoute<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Tests a PUT request to an API route
 */
export async function testPUT<T>(path: string, body: any): Promise<T> {
  return testAPIRoute<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Tests a DELETE request to an API route
 */
export async function testDELETE<T>(path: string): Promise<T> {
  return testAPIRoute<T>(path, { method: 'DELETE' });
}

// ============================================================================
// Validation Testing Helpers
// ============================================================================

/**
 * Tests that validation succeeds
 */
export function assertValidationSuccess(
  result: { valid: boolean; errors?: any[] }
): void {
  if (!result.valid) {
    throw new Error(
      `Expected validation to succeed, but got errors: ${JSON.stringify(result.errors)}`
    );
  }
}

/**
 * Tests that validation fails with expected errors
 */
export function assertValidationFailure(
  result: { valid: boolean; errors?: any[] },
  expectedField?: string
): void {
  if (result.valid) {
    throw new Error('Expected validation to fail, but it succeeded');
  }
  if (expectedField && !result.errors?.some((e) => e.field === expectedField)) {
    throw new Error(
      `Expected error for field "${expectedField}", but got: ${JSON.stringify(result.errors)}`
    );
  }
}

// ============================================================================
// Locale Testing Helpers
// ============================================================================

/**
 * Gets all supported locales for testing
 */
export function getTestLocales(): Locale[] {
  return ['pt', 'en'];
}

/**
 * Creates test data for all locales
 */
export function createMultilingualTestData<T>(
  factory: (locale: Locale) => T
): Record<Locale, T> {
  return {
    pt: factory('pt'),
    en: factory('en'),
  };
}

// ============================================================================
// Database Testing Helpers
// ============================================================================

/**
 * Waits for a condition to be true (useful for async operations)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Generates a unique slug for testing
 */
export function generateTestSlug(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cleans up test data by slug pattern
 */
export async function cleanupTestData(
  table: string,
  slugPattern: string
): Promise<void> {
  // This would be implemented with actual Supabase client
  // For now, it's a placeholder for documentation
  console.log(`Cleanup: DELETE FROM ${table} WHERE slug LIKE '${slugPattern}%'`);
}
