# API Reference

## Server Actions

### Team Actions

```typescript
import { saveTeamMember, deleteTeamMember } from '@/app/actions/team';

// Save (create or update)
const result = await saveTeamMember({
  id: 'optional-for-update',
  slug: 'john-doe',
  photo_url: '/path/to/photo.jpg',
  display_order: 1,
  email: 'john@example.com',
  phone: '+351 123 456 789',
  is_published: true,
  team_member_translations: [
    {
      language_code: 'pt',
      name: 'Dr. João Silva',
      title: 'Dentista',
      specialty: 'Ortodontia',
      credentials: 'OMD 12345',
      bio: 'Bio text...'
    },
    {
      language_code: 'en',
      name: 'Dr. John Silva',
      title: 'Dentist',
      specialty: 'Orthodontics',
      credentials: 'OMD 12345',
      bio: 'Bio text...'
    }
  ],
  specialties: ['treatment-id-1', 'treatment-id-2']
});

// Delete
const result = await deleteTeamMember('member-id');
```

### Treatment Actions

```typescript
import { saveTreatment, deleteTreatment, getTreatments, getTeamMembers } from '@/app/actions/treatments';

// Save treatment
const result = await saveTreatment({
  id: 'optional-for-update',
  slug: 'branqueamento',
  category: 'dentistry',
  icon_name: 'tooth',
  icon_url: '/icons/tooth.svg',
  hero_image_url: '/images/hero.jpg',
  display_order: 1,
  is_published: true,
  treatment_translations: [
    {
      language_code: 'pt',
      title: 'Branqueamento Dentário',
      subtitle: 'Dentes mais brancos',
      description: '...',
      short_description: '...',
      benefits: '...',
      procedure: '...',
      aftercare: '...',
      meta_title: 'SEO Title',
      meta_description: 'SEO Description'
    }
  ]
});

// Get all treatments
const result = await getTreatments();

// Get all team members
const result = await getTeamMembers();

// Delete treatment
const result = await deleteTreatment('treatment-id');
```

## API Routes

### GET /api/treatments

Get all published treatments for a locale.

**Query Parameters:**
- `locale` (optional): Language code (default: 'pt')
- `slug` (optional): Get single treatment by slug

**Examples:**
```bash
# Get all treatments in Portuguese
curl 'http://localhost:3000/api/treatments?locale=pt'

# Get all treatments in English
curl 'http://localhost:3000/api/treatments?locale=en'

# Get single treatment
curl 'http://localhost:3000/api/treatments?slug=branqueamento&locale=pt'
```

**Response:**
```json
[
  {
    "id": "uuid",
    "slug": "branqueamento",
    "category": "dentistry",
    "icon_url": "/icons/tooth.svg",
    "hero_image_url": "/images/hero.jpg",
    "display_order": 1,
    "is_published": true,
    "treatment_translations": [
      {
        "language_code": "pt",
        "title": "Branqueamento Dentário",
        "subtitle": "Dentes mais brancos",
        "description": "...",
        "short_description": "...",
        "benefits": "...",
        "procedure": "...",
        "aftercare": "..."
      }
    ]
  }
]
```

### GET /api/team

Get all published team members for a locale.

**Query Parameters:**
- `locale` (optional): Language code (default: 'pt')

**Example:**
```bash
curl 'http://localhost:3000/api/team?locale=pt'
```

**Response:**
```json
[
  {
    "id": "uuid",
    "slug": "carlos-sousa",
    "photo_url": "/photos/carlos.jpg",
    "display_order": 1,
    "email": "carlos@example.com",
    "phone": "+351 123 456 789",
    "is_published": true,
    "team_member_translations": [
      {
        "language_code": "pt",
        "name": "Dr. Carlos Sousa",
        "title": "Dentista",
        "specialty": "Ortodontia",
        "credentials": "OMD 12345",
        "bio": "Bio text..."
      }
    ],
    "team_member_specialties": [
      {
        "team_member_id": "uuid",
        "treatment_id": "uuid",
        "treatments": {
          "slug": "ortodontia",
          "treatment_translations": [
            {
              "title": "Ortodontia",
              "language_code": "pt"
            }
          ]
        }
      }
    ]
  }
]
```

## API Client Usage

### Client Components

```typescript
'use client';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiClient.getTreatments('pt');
        setTreatments(data);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {treatments.map(t => (
        <div key={t.id}>{t.treatment_translations[0].title}</div>
      ))}
    </div>
  );
}
```

### Available Methods

```typescript
// Get all treatments for a locale
const treatments = await apiClient.getTreatments('pt');

// Get single treatment by slug
const treatment = await apiClient.getTreatment('branqueamento', 'pt');

// Get all team members
const team = await apiClient.getTeamMembers('pt');
```

## Error Handling

All server actions return:
```typescript
interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}
```

**Example:**
```typescript
const result = await saveTeamMember(data);

if (result.success) {
  console.log('Saved successfully!');
} else {
  console.error('Error:', result.error);
  alert(`Failed to save: ${result.error}`);
}
```

## Response Codes

### API Routes
- `200` - Success
- `404` - Not found (single resource)
- `500` - Server error

### Server Actions
Always return `{ success: boolean, error?: string }`

## Localization

All endpoints support language via `locale` parameter:
- `pt` - Portuguese (default)
- `en` - English

Translation data is filtered server-side for the requested locale.

## Testing

### Test Server Actions
```typescript
// In browser console or test file
const { saveTeamMember } = await import('/app/actions/team');
const result = await saveTeamMember({ ... });
console.log(result);
```

### Test API Routes
```bash
# Using curl
curl 'http://localhost:3000/api/treatments?locale=pt' | jq

# Using browser
fetch('/api/treatments?locale=pt').then(r => r.json()).then(console.log)
```

### Test Endpoint
```bash
# Automated test for team save
curl http://localhost:3000/api/test-team-save | jq
```

## Cache Revalidation

Server actions automatically revalidate affected paths:

```typescript
revalidatePath('/[locale]/admin');
revalidatePath('/[locale]/equipa');
revalidatePath('/[locale]/tratamentos');
```

This ensures fresh data is shown after mutations.

## TypeScript Types

```typescript
// Team Member
interface TeamMemberData {
  id?: string;
  slug: string;
  photo_url: string;
  display_order: number;
  email?: string;
  phone?: string;
  is_published: boolean;
  team_member_translations: Array<{
    language_code: string;
    name: string;
    title: string;
    specialty: string;
    credentials?: string;
    bio?: string;
  }>;
  specialties?: string[];
}

// Treatment
interface TreatmentData {
  id?: string;
  slug: string;
  category: string;
  icon_name?: string;
  icon_url?: string;
  hero_image_url?: string;
  display_order: number;
  is_published: boolean;
  treatment_translations: Array<{
    language_code: string;
    title: string;
    subtitle?: string;
    description?: string;
    short_description?: string;
    benefits?: string;
    procedure?: string;
    aftercare?: string;
    meta_title?: string;
    meta_description?: string;
  }>;
}
```

## Best Practices

1. **Always handle errors** - All API calls can fail
2. **Use TypeScript** - Types are provided for all data structures
3. **Cache appropriately** - Use SWR or React Query for client-side caching
4. **Validate input** - Server actions validate data before saving
5. **Test mutations** - Use the test endpoint to verify functionality
6. **Monitor logs** - Server actions log detailed operation info
