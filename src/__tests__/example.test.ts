/**
 * Example test file demonstrating testing patterns
 * This shows how to test various parts of the application
 *
 * To run tests, use: npm test or npx jest
 * Note: This requires jest and testing-library to be installed
 */

import {
  createMockTreatment,
  createMockTeamMember,
  testServerAction,
  assertActionSuccess,
  assertValidationSuccess,
  assertValidationFailure,
  generateTestSlug,
} from '@/lib/test-utils';
import { validateTreatment, validateTeamMember } from '@/lib/validation';
import type { TreatmentFormData, TeamMemberFormData } from '@/types';

// ============================================================================
// Validation Tests
// ============================================================================

describe('Treatment Validation', () => {
  it('should validate a valid treatment', () => {
    const validTreatment: TreatmentFormData = {
      slug: 'test-treatment',
      category: 'general',
      icon_url: 'https://example.com/icon.svg',
      hero_image_url: 'https://example.com/hero.jpg',
      display_order: 0,
      is_featured: false,
      is_published: true,
      treatment_translations: [
        {
          language_code: 'pt',
          title: 'Test Treatment',
          subtitle: 'Test Subtitle',
          description: 'Test Description',
        },
      ],
    };

    const result = validateTreatment(validTreatment);
    assertValidationSuccess(result);
  });

  it('should fail validation for missing slug', () => {
    const invalidTreatment: any = {
      category: 'general',
      treatment_translations: [
        {
          language_code: 'pt',
          title: 'Test',
          description: 'Description',
        },
      ],
    };

    const result = validateTreatment(invalidTreatment);
    assertValidationFailure(result, 'slug');
  });

  it('should fail validation for invalid slug format', () => {
    const invalidTreatment: TreatmentFormData = {
      slug: 'Invalid Slug!',
      category: 'general',
      treatment_translations: [
        {
          language_code: 'pt',
          title: 'Test',
          description: 'Description',
        },
      ],
    };

    const result = validateTreatment(invalidTreatment);
    assertValidationFailure(result, 'slug');
  });
});

describe('Team Member Validation', () => {
  it('should validate a valid team member', () => {
    const validMember: TeamMemberFormData = {
      slug: 'test-member',
      photo_url: 'https://example.com/photo.jpg',
      email: 'test@example.com',
      team_member_translations: [
        {
          language_code: 'pt',
          name: 'Test Member',
          title: 'Dentist',
          bio: 'Bio text',
        },
      ],
    };

    const result = validateTeamMember(validMember);
    assertValidationSuccess(result);
  });

  it('should fail validation for invalid email', () => {
    const invalidMember: TeamMemberFormData = {
      slug: 'test-member',
      photo_url: 'https://example.com/photo.jpg',
      email: 'invalid-email',
      team_member_translations: [
        {
          language_code: 'pt',
          name: 'Test',
          title: 'Title',
        },
      ],
    };

    const result = validateTeamMember(invalidMember);
    assertValidationFailure(result, 'email');
  });
});

// ============================================================================
// Server Action Tests (Example)
// ============================================================================

describe('Server Actions', () => {
  it('should create a treatment successfully', async () => {
    // This is a conceptual example - actual implementation would use real actions
    const mockAction = async () => {
      return { success: true, data: createMockTreatment() };
    };

    const result = await testServerAction(mockAction);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const mockAction = async () => {
      throw new Error('Database error');
    };

    const result = await testServerAction(mockAction);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Database error');
  });
});

// ============================================================================
// API Route Tests (Example)
// ============================================================================

describe('API Routes', () => {
  it('should fetch treatments', async () => {
    // This would require a running server
    // const treatments = await testGET('/api/treatments?locale=pt');
    // expect(Array.isArray(treatments)).toBe(true);
  });

  it('should fetch a single treatment by slug', async () => {
    // const treatment = await testGET('/api/treatments?slug=test&locale=pt');
    // expect(treatment).toBeDefined();
    // expect(treatment.slug).toBe('test');
  });
});

// ============================================================================
// Utility Tests
// ============================================================================

describe('Test Utilities', () => {
  it('should generate unique test slugs', () => {
    const slug1 = generateTestSlug('treatment');
    const slug2 = generateTestSlug('treatment');

    expect(slug1).not.toBe(slug2);
    expect(slug1).toMatch(/^treatment-/);
  });

  it('should create mock data with overrides', () => {
    const treatment = createMockTreatment({
      slug: 'custom-slug',
      is_featured: true,
    });

    expect(treatment.slug).toBe('custom-slug');
    expect(treatment.is_featured).toBe(true);
  });
});

// ============================================================================
// Integration Tests (Example)
// ============================================================================

describe('Treatment CRUD Integration', () => {
  const testSlug = generateTestSlug('integration-test');

  afterAll(async () => {
    // Clean up test data
    // await cleanupTestData('treatments', 'integration-test');
  });

  it('should complete full CRUD cycle', async () => {
    // 1. Create
    // const created = await saveTreatment({ slug: testSlug, ... });
    // expect(created.success).toBe(true);

    // 2. Read
    // const treatment = await getTreatment(testSlug);
    // expect(treatment.slug).toBe(testSlug);

    // 3. Update
    // const updated = await saveTreatment({ ...treatment, is_featured: true });
    // expect(updated.success).toBe(true);

    // 4. Delete
    // const deleted = await deleteTreatment(testSlug);
    // expect(deleted.success).toBe(true);
  });
});
