# Architecture Audit & Improvement Plan

## 🔍 Current State Analysis

### ✅ Strengths
1. **Clean separation**: Database for structured data, translation files for text
2. **Consistent patterns**: Server components, API routes, client components
3. **Type safety**: TypeScript used throughout
4. **Modern stack**: Next.js 15, App Router, Server Components
5. **Good UX**: Visual and code editing modes for content

### ⚠️ Areas for Improvement

#### 1. **Type Safety Issues**
- Missing shared types across modules
- `any` types in some places (e.g., team member transformation)
- No validation schemas (Zod/Yup)
- Operating hours type not strictly typed

#### 2. **Error Handling**
- Inconsistent error handling patterns
- No structured error responses
- Limited user-friendly error messages
- No retry mechanisms for failed operations

#### 3. **Data Validation**
- No input validation on API routes
- No sanitization of user inputs
- Missing phone/email format validation
- No constraint checking

#### 4. **Language Management**
- Hardcoded language list (`pt`, `en`)
- No way to add new languages via admin
- Translation file creation is manual
- No language completeness checking

#### 5. **Code Duplication**
- Similar CRUD patterns repeated
- Repeated Supabase error handling
- Duplicated type definitions
- No shared form components

#### 6. **Testing**
- No unit tests
- No integration tests
- No E2E tests
- Manual testing only

#### 7. **Configuration**
- Environment variables not centralized
- No validation of required env vars
- Hardcoded values in components

#### 8. **Security**
- No rate limiting on API routes
- No CSRF protection
- No input sanitization
- RLS policies could be more granular

---

## 🎯 Improvement Roadmap

### Phase 1: Type Safety & Validation (High Priority)

#### 1.1 Create Shared Type Definitions
```typescript
// src/types/admin.ts - Centralized types
export interface ClinicSettings { ... }
export interface TeamMember { ... }
export interface Treatment { ... }
export interface Language {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
  isDefault: boolean;
}
```

#### 1.2 Add Zod Validation Schemas
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const clinicSettingsSchema = z.object({
  phone: z.string().regex(/^\d{9}$/, 'Invalid phone format'),
  email: z.string().email('Invalid email'),
  // ...
});
```

#### 1.3 Create API Response Types
```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}
```

---

### Phase 2: Language Management System (NEW FEATURE)

#### 2.1 Database Schema for Languages
```sql
-- supabase/migrations/20251015000200_create_languages_system.sql
CREATE TABLE supported_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default language
CREATE UNIQUE INDEX idx_one_default_language
  ON supported_languages (is_default)
  WHERE is_default = true;

-- Seed default languages
INSERT INTO supported_languages (code, name, native_name, flag, enabled, is_default, display_order) VALUES
  ('pt', 'Portuguese', 'Português', '🇵🇹', true, true, 1),
  ('en', 'English', 'English', '🇬🇧', true, false, 2);
```

#### 2.2 Language Management Admin Interface
- `/admin/settings/languages` - Manage languages
- Add/edit/disable languages
- Set default language
- Reorder languages
- Check translation completeness

#### 2.3 Translation File Management
- Auto-create translation files for new languages
- Copy from default language as template
- Track translation progress (% complete)
- Highlight missing translations

---

### Phase 3: Error Handling & Logging

#### 3.1 Centralized Error Handler
```typescript
// src/lib/errors/handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): ApiResponse<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };
  }

  return {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };
}
```

#### 3.2 Structured Logging
```typescript
// src/lib/logging/logger.ts
export const logger = {
  info: (message: string, meta?: object) => { ... },
  error: (message: string, error: Error, meta?: object) => { ... },
  warn: (message: string, meta?: object) => { ... },
};
```

---

### Phase 4: Shared Components & Utilities

#### 4.1 Create Reusable Form Components
```typescript
// src/components/admin/forms/
- FormInput.tsx
- FormTextarea.tsx
- FormSelect.tsx
- FormCheckbox.tsx
- FormTimeInput.tsx
- FormImageUpload.tsx
```

#### 4.2 Create Data Fetching Utilities
```typescript
// src/lib/data/fetcher.ts
export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options?: { retries?: number; delay?: number }
): Promise<T> { ... }
```

#### 4.3 Create Validation Utilities
```typescript
// src/lib/validation/utils.ts
export function validateAndTransform<T>(
  schema: z.Schema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } { ... }
```

---

### Phase 5: Configuration Management

#### 5.1 Centralized Config
```typescript
// src/config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_PLACE_ID: z.string().min(1),
  // Add all required env vars
});

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  google: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    placeId: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID,
  },
  languages: {
    default: 'pt',
    supported: ['pt', 'en'], // Will be fetched from DB in Phase 2
  },
};

// Validate on startup
envSchema.parse(process.env);
```

---

### Phase 6: Admin Navigation Improvements

#### 6.1 Add Breadcrumbs
```typescript
// src/components/admin/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) { ... }
```

#### 6.2 Add Sidebar Navigation
```typescript
// src/components/admin/Sidebar.tsx
- Collapsible sections
- Active state highlighting
- Search functionality
- Quick actions
```

#### 6.3 Add Toast Notifications
```typescript
// src/components/admin/Toast.tsx
- Success/error/warning notifications
- Auto-dismiss
- Action buttons
```

---

### Phase 7: Data Validation & Sanitization

#### 7.1 API Route Middleware
```typescript
// src/middleware/validation.ts
export function withValidation<T>(
  schema: z.Schema<T>,
  handler: (data: T, req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    const body = await req.json();
    const result = validateAndTransform(schema, body);

    if (!result.success) {
      return Response.json({
        success: false,
        error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: result.errors },
      }, { status: 400 });
    }

    return handler(result.data, req);
  };
}
```

#### 7.2 Input Sanitization
```typescript
// src/lib/validation/sanitize.ts
export function sanitizeHtml(input: string): string { ... }
export function sanitizePhoneNumber(phone: string): string { ... }
export function sanitizeEmail(email: string): string { ... }
```

---

### Phase 8: Testing Infrastructure

#### 8.1 Unit Tests Setup
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
```

#### 8.2 Example Test Structure
```typescript
// src/lib/validation/__tests__/schemas.test.ts
describe('clinicSettingsSchema', () => {
  it('validates correct phone number', () => { ... });
  it('rejects invalid email', () => { ... });
});
```

---

## 🚀 Implementation Priority

### Immediate (This Session)
1. ✅ Language management system
2. ✅ Shared type definitions
3. ✅ Configuration centralization

### Short-term (Next Sprint)
1. Add Zod validation
2. Improve error handling
3. Add shared form components

### Medium-term (Next Month)
1. Add testing infrastructure
2. Implement rate limiting
3. Add logging system

### Long-term (Future)
1. E2E testing
2. Performance monitoring
3. Advanced security features

---

## 📊 Metrics for Success

After improvements:
- [ ] 0 `any` types in codebase
- [ ] 100% API routes with validation
- [ ] 80%+ test coverage
- [ ] All env vars validated on startup
- [ ] Language management fully functional
- [ ] < 2s page load times
- [ ] 0 security vulnerabilities

---

## 🛠️ Tools to Add

1. **Zod** - Runtime type validation
2. **React Hook Form** - Better form management (already partially used)
3. **Winston/Pino** - Structured logging
4. **Vitest** - Fast unit testing
5. **Playwright** - E2E testing
6. **DOMPurify** - HTML sanitization
7. **React Hot Toast** - Toast notifications

---

Next: Implementation of Language Management System
