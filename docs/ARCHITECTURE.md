# Clínica Ferreira Borges - Architecture Documentation

## Overview

This project follows Next.js 15 best practices with a clean separation between server-side and client-side code.

## Architecture Layers

### 1. **Server Actions** (`src/app/actions/`)

Server actions handle all database mutations and provide type-safe interfaces.

#### Team Actions (`actions/team.ts`)
- `saveTeamMember()` - Create/update team members with translations & specialties
- `deleteTeamMember()` - Delete team members

#### Treatment Actions (`actions/treatments.ts`)
- `saveTreatment()` - Create/update treatments with translations
- `deleteTreatment()` - Delete treatments
- `getTreatments()` - Fetch all treatments
- `getTeamMembers()` - Fetch all team members

**Benefits:**
- ✅ Server-side execution (secure)
- ✅ Type-safe with TypeScript
- ✅ Automatic revalidation with `revalidatePath()`
- ✅ Centralized error handling

### 2. **API Routes** (`src/app/api/`)

RESTful API endpoints for client-side data fetching.

#### Treatments API (`/api/treatments`)
```typescript
GET /api/treatments?locale=pt        // Get all treatments
GET /api/treatments?slug=X&locale=pt  // Get single treatment
```

#### Team API (`/api/team`)
```typescript
GET /api/team?locale=pt              // Get all team members with specialties
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Can be consumed by any client (web, mobile, etc.)
- ✅ Proper error handling with HTTP status codes
- ✅ Language support via query parameters

### 3. **API Client** (`src/lib/api-client.ts`)

Reusable client for making API requests from frontend components.

```typescript
import { apiClient } from '@/lib/api-client';

// Usage
const treatments = await apiClient.getTreatments('pt');
const team = await apiClient.getTeamMembers('en');
const treatment = await apiClient.getTreatment('branqueamento', 'pt');
```

**Benefits:**
- ✅ Centralized request handling
- ✅ Automatic error handling
- ✅ Type-safe responses
- ✅ Easy to mock for testing

### 4. **Database Queries** (`src/lib/supabase/queries/`)

Server-side queries for SSR pages (Server Components).

```typescript
// For Server Components only
import { getTeamMembers } from '@/lib/supabase/queries/team';

const members = await getTeamMembers(locale);
```

**When to use:**
- ✅ Server Components (RSC)
- ✅ Initial page load data
- ✅ SEO-critical content

## Data Flow Patterns

### Pattern 1: Server Component (SSR)
```
Page (Server Component)
  → Direct Query (`queries/team.ts`)
  → Supabase Server Client
  → Database
```

**Example:** Team page, Treatment pages

### Pattern 2: Client Component
```
Component (Client Component)
  → API Client (`api-client.ts`)
  → API Route (`/api/treatments`)
  → Supabase Server Client
  → Database
```

**Example:** Header mega menu, Admin components

### Pattern 3: Mutations (Admin)
```
Admin Page (Client Component)
  → Server Action (`actions/team.ts`)
  → Supabase Server Client
  → Database
  → revalidatePath()
```

**Example:** Save team member, Save treatment

## Component Structure

### Server Components
- Pages (`app/[locale]/*/page.tsx`)
- Use direct queries for initial data
- Great for SEO and performance

### Client Components
- Interactive UI (`components/`)
- Use API client for data fetching
- Use server actions for mutations

## Best Practices

### ✅ DO
- Use Server Actions for all mutations (create, update, delete)
- Use API routes for client-side data fetching
- Use direct queries for Server Components
- Keep database logic server-side
- Use TypeScript interfaces for data contracts

### ❌ DON'T
- Don't use Supabase client directly in Client Components
- Don't expose database queries to the frontend
- Don't skip error handling
- Don't forget to revalidate paths after mutations

## Environment Variables

```bash
# Supabase (local development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Custom API URL for production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Testing

### Test API Endpoints
```bash
# Get treatments
curl 'http://localhost:3000/api/treatments?locale=pt' | jq

# Get team members
curl 'http://localhost:3000/api/team?locale=pt' | jq

# Get single treatment
curl 'http://localhost:3000/api/treatments?slug=branqueamento&locale=pt' | jq
```

### Test Server Actions
Use the test endpoint:
```bash
curl http://localhost:3000/api/test-team-save | jq
```

## Database Schema

### Core Tables
- `treatments` - Treatment services
- `treatment_translations` - Multilingual content
- `team_members` - Staff members
- `team_member_translations` - Multilingual staff info
- `team_member_specialties` - Many-to-many link to treatments

### Storage Buckets
- `treatment-images` - Hero images for treatments
- `treatment-icons` - Icons for treatment cards
- `team-photos` - Staff member photos

## Security

- ✅ All database operations happen server-side
- ✅ Row Level Security (RLS) policies in Supabase
- ✅ No direct database access from client
- ✅ API routes validate requests
- ✅ Server actions are type-safe

## Performance

- ✅ Server-side rendering for initial load
- ✅ Automatic caching with `revalidatePath()`
- ✅ Optimized images with Next.js Image component
- ✅ Code splitting by route
- ✅ API responses are minimal and optimized

## Deployment

This architecture supports:
- Vercel (recommended)
- Any Node.js hosting
- Serverless environments
- Edge computing

## Migration Notes

### Before (❌ Anti-pattern)
```typescript
// Client Component - BAD
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('treatments').select('*');
```

### After (✅ Best Practice)
```typescript
// Client Component - GOOD
'use client';
import { apiClient } from '@/lib/api-client';

const data = await apiClient.getTreatments('pt');
```

## Files Changed in Refactor

### Created
- `src/app/actions/team.ts` - Team server actions
- `src/app/actions/treatments.ts` - Treatment server actions
- `src/app/api/treatments/route.ts` - Treatments API
- `src/app/api/team/route.ts` - Team API
- `src/lib/api-client.ts` - API client utility

### Updated
- `src/components/layout/Header.tsx` - Uses API client
- `src/components/admin/TeamMemberEditor.tsx` - Uses API client
- `src/app/[locale]/admin/page.tsx` - Uses server actions
- `src/components/admin/ImageUpload.tsx` - Added team-photos bucket

## Monitoring & Debugging

Server actions and API routes log detailed information:
```
💾 Saving team member: carlos-sousa
📝 Updating existing team member: d90198...
✅ Team member updated
🌐 Updating translation: pt
✅ Translations updated
🎉 Team member saved successfully!
```

Check server logs for detailed operation tracking.
