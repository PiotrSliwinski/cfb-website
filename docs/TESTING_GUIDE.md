# Testing Guide

This guide explains the testing strategy and utilities for the Clínica Ferreira Borges website.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Utilities](#test-utilities)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)

## Testing Strategy

The application uses a multi-layered testing approach:

### 1. Unit Tests
- Test individual functions and utilities
- Validate validation logic
- Test data transformations
- Mock external dependencies

### 2. Integration Tests
- Test server actions with real database operations
- Test API routes end-to-end
- Verify data flow between layers

### 3. Component Tests
- Test React components in isolation
- Verify user interactions
- Test conditional rendering

### 4. E2E Tests (Future)
- Test complete user workflows
- Verify critical paths
- Test across different locales

## Test Utilities

The application provides comprehensive test utilities in `src/lib/test-utils.ts`:

### Mock Data Factories

Create realistic test data easily:

```typescript
import { createMockTreatment, createMockTeamMember } from '@/lib/test-utils';

const treatment = createMockTreatment({
  slug: 'test-treatment',
  is_featured: true,
});

const member = createMockTeamMember({
  email: 'doctor@example.com',
});
```

### API Testing Helpers

Test API routes with type-safe helpers:

```typescript
import { testGET, testPOST } from '@/lib/test-utils';

// Test GET request
const treatments = await testGET<Treatment[]>('/api/treatments?locale=pt');

// Test POST request
const result = await testPOST('/api/treatments', {
  slug: 'new-treatment',
  category: 'general',
});
```

### Server Action Testing

Test server actions with error handling:

```typescript
import { testServerAction, assertActionSuccess } from '@/lib/test-utils';

const result = await testServerAction(async () => {
  return await saveTreatment(data);
});

// Or assert success
const data = await assertActionSuccess(async () => {
  return await getTreatment('slug');
});
```

### Validation Testing

Test validation with clear assertions:

```typescript
import { assertValidationSuccess, assertValidationFailure } from '@/lib/test-utils';
import { validateTreatment } from '@/lib/validation';

const result = validateTreatment(data);

// Assert success
assertValidationSuccess(result);

// Assert failure for specific field
assertValidationFailure(result, 'slug');
```

## Writing Tests

### Unit Test Example

```typescript
import { sanitizeSlug } from '@/lib/validation';

describe('sanitizeSlug', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeSlug('TEST')).toBe('test');
  });

  it('should replace spaces with hyphens', () => {
    expect(sanitizeSlug('test slug')).toBe('test-slug');
  });

  it('should remove special characters', () => {
    expect(sanitizeSlug('test@slug!')).toBe('testslug');
  });
});
```

### Validation Test Example

```typescript
import { validateTreatment } from '@/lib/validation';
import { assertValidationSuccess, assertValidationFailure } from '@/lib/test-utils';

describe('validateTreatment', () => {
  it('should validate correct data', () => {
    const data = {
      slug: 'valid-slug',
      category: 'general',
      treatment_translations: [{
        language_code: 'pt',
        title: 'Title',
        description: 'Description',
      }],
    };

    const result = validateTreatment(data);
    assertValidationSuccess(result);
  });

  it('should fail for missing slug', () => {
    const data = {
      category: 'general',
      treatment_translations: [],
    };

    const result = validateTreatment(data);
    assertValidationFailure(result, 'slug');
  });
});
```

### API Route Test Example

```typescript
import { testGET } from '@/lib/test-utils';

describe('GET /api/treatments', () => {
  it('should return all treatments', async () => {
    const treatments = await testGET('/api/treatments?locale=pt');

    expect(Array.isArray(treatments)).toBe(true);
    expect(treatments.length).toBeGreaterThan(0);
  });

  it('should filter by slug', async () => {
    const treatment = await testGET('/api/treatments?slug=test&locale=pt');

    expect(treatment).toBeDefined();
    expect(treatment.slug).toBe('test');
  });
});
```

### Server Action Test Example

```typescript
import { testServerAction } from '@/lib/test-utils';
import { saveTreatment } from '@/app/actions/treatments';

describe('saveTreatment', () => {
  it('should create new treatment', async () => {
    const data = {
      slug: 'new-treatment',
      category: 'general',
      treatment_translations: [{
        language_code: 'pt',
        title: 'New Treatment',
      }],
    };

    const result = await testServerAction(async () => {
      return await saveTreatment(data);
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      slug: '', // Invalid
      category: 'general',
    };

    const result = await testServerAction(async () => {
      return await saveTreatment(invalidData);
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
import { generateTestSlug, cleanupTestData } from '@/lib/test-utils';

describe('Treatment CRUD', () => {
  const testSlug = generateTestSlug('integration');

  afterAll(async () => {
    await cleanupTestData('treatments', 'integration');
  });

  it('should complete full CRUD cycle', async () => {
    // Create
    const created = await saveTreatment({ slug: testSlug, ... });
    expect(created.success).toBe(true);

    // Read
    const treatment = await getTreatment(testSlug);
    expect(treatment.slug).toBe(testSlug);

    // Update
    const updated = await saveTreatment({ ...treatment, is_featured: true });
    expect(updated.success).toBe(true);

    // Delete
    const deleted = await deleteTreatment(testSlug);
    expect(deleted.success).toBe(true);
  });
});
```

## Running Tests

### Setup

1. Install testing dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev @types/jest
```

2. Create `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

3. Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

4. Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/validation.test.ts
```

## Best Practices

### 1. Test Organization

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── validation.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── treatments.test.ts
│   │   └── team.test.ts
│   └── components/
│       ├── Header.test.tsx
│       └── Footer.test.tsx
```

### 2. Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Describe blocks: Use clear, hierarchical descriptions
- Test cases: Start with "should" for clarity

```typescript
describe('Treatment Validation', () => {
  describe('slug validation', () => {
    it('should accept valid slug format', () => {});
    it('should reject invalid characters', () => {});
  });
});
```

### 3. Test Independence

- Each test should be independent
- Use `beforeEach` for setup
- Use `afterEach` for cleanup
- Don't rely on test execution order

```typescript
describe('Treatment API', () => {
  let testSlug: string;

  beforeEach(() => {
    testSlug = generateTestSlug();
  });

  afterEach(async () => {
    await cleanupTestData('treatments', testSlug);
  });

  it('should create treatment', async () => {
    // Test uses fresh testSlug
  });
});
```

### 4. Mock External Dependencies

```typescript
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({ data: [], error: null })),
    })),
  })),
}));
```

### 5. Test Coverage Goals

- Aim for >80% code coverage
- 100% coverage for critical paths:
  - Validation logic
  - Data transformations
  - Security-sensitive code

### 6. Performance

- Keep tests fast (<100ms per test)
- Use test databases for integration tests
- Mock slow operations
- Run expensive tests separately

### 7. Multilingual Testing

Test both locales:

```typescript
import { getTestLocales, createMultilingualTestData } from '@/lib/test-utils';

describe('Multilingual Features', () => {
  it('should work in all locales', () => {
    getTestLocales().forEach(locale => {
      const translation = getTranslation(locale);
      expect(translation).toBeDefined();
    });
  });
});
```

## Test Endpoints

The application includes test endpoints for quick verification:

### Test Team Save

```bash
curl http://localhost:3000/api/test-team-save
```

This endpoint:
- Creates a test team member
- Verifies save operation
- Tests specialty assignment
- Validates data retrieval

### Test Treatment Save

```bash
curl http://localhost:3000/api/test-treatment-save
```

This endpoint:
- Creates a test treatment
- Verifies translations
- Tests category assignment
- Validates featured flag

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm test
      - run: npm run test:coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug Specific Test

```bash
npm test -- --testNamePattern="should validate treatment"
```

### Use Node Debugger

```json
{
  "scripts": {
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

Then attach your debugger to the Node process.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
