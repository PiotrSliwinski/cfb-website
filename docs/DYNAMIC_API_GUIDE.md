# Dynamic API System - Complete Guide
**Strapi-Inspired Generic CRUD API for Next.js**

## 🎯 Overview

Your admin panel now has a **fully dynamic API system** that automatically generates REST endpoints for ANY content type you create - just like Strapi!

No code changes needed when adding new content types. Create a content type in the UI, and the API routes are instantly available.

---

## 🚀 How It Works

### 1. Create a Content Type (via UI or API)

```bash
POST /api/content-types
{
  "name": "blog_posts",
  "display_name": "Blog Posts",
  "singular_name": "Blog Post",
  "icon": "FileText"
}
```

### 2. Add Fields

```bash
POST /api/content-types/{id}/fields
{
  "name": "title",
  "display_name": "Title",
  "type": "text",
  "required": true
}
```

### 3. API Routes Are Automatically Available!

```bash
GET    /api/blog_posts              # List all
GET    /api/blog_posts/123          # Get one
POST   /api/blog_posts              # Create
PUT    /api/blog_posts/123          # Update
DELETE /api/blog_posts/123          # Delete
POST   /api/blog_posts/123/actions  # Publish/unpublish
```

---

## 📡 API Endpoints

### List All Entries
```http
GET /api/{collection}
```

**Query Parameters:**
- `filters[field][$operator]=value` - Filter results
- `pagination[page]=1` - Page number
- `pagination[pageSize]=25` - Items per page
- `sort=field:asc,field2:desc` - Sort order
- `populate=field1,field2` - Include relations
- `locale=en` - Language
- `publicationState=live` - Only published (`live`) or all (`preview`)

**Example:**
```bash
GET /api/blog_posts?filters[title][$contains]=Next.js&pagination[page]=1&pagination[pageSize]=10&sort=createdAt:desc&publicationState=live
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "content_type_id": "uuid",
      "status": "published",
      "data": {
        "title": "Getting Started with Next.js",
        "content": "...",
        "featured_image": "url"
      },
      "created_at": "2025-10-07T10:00:00Z",
      "updated_at": "2025-10-07T11:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 42
    }
  }
}
```

### Get Single Entry
```http
GET /api/{collection}/{id}
```

**Query Parameters:**
- `populate=field1,field2` - Include relations
- `locale=en` - Language

**Example:**
```bash
GET /api/blog_posts/550e8400-e29b-41d4-a716-446655440000?locale=pt
```

### Create Entry
```http
POST /api/{collection}
```

**Body:**
```json
{
  "data": {
    "title": "My New Post",
    "content": "Hello world",
    "slug": "my-new-post"
  },
  "translations": [
    {
      "language_code": "pt",
      "data": {
        "title": "Meu Novo Post",
        "content": "Olá mundo"
      }
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "content_type_id": "uuid",
    "status": "draft",
    "data": { ... },
    "created_at": "2025-10-07T10:00:00Z"
  }
}
```

### Update Entry
```http
PUT /api/{collection}/{id}
```

**Body:** Same as create

### Delete Entry
```http
DELETE /api/{collection}/{id}
```

**Response:** `204 No Content`

### Execute Action (Publish/Unpublish)
```http
POST /api/{collection}/{id}/actions
```

**Body:**
```json
{
  "action": "publish"  // or "unpublish", "archive"
}
```

---

## 🔍 Filter Operators

The API supports Strapi-compatible filter operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal | `filters[status][$eq]=published` |
| `$ne` | Not equal | `filters[status][$ne]=draft` |
| `$in` | In array | `filters[id][$in][]=1&filters[id][$in][]=2` |
| `$notIn` | Not in array | `filters[status][$notIn][]=archived` |
| `$lt` | Less than | `filters[price][$lt]=100` |
| `$lte` | Less than or equal | `filters[price][$lte]=100` |
| `$gt` | Greater than | `filters[views][$gt]=1000` |
| `$gte` | Greater than or equal | `filters[views][$gte]=1000` |
| `$contains` | Contains (case insensitive) | `filters[title][$contains]=Next` |
| `$notContains` | Does not contain | `filters[title][$notContains]=old` |
| `$startsWith` | Starts with | `filters[slug][$startsWith]=blog` |
| `$endsWith` | Ends with | `filters[slug][$endsWith]=2024` |
| `$null` | Is null or not null | `filters[publishedAt][$null]=true` |

### Complex Filter Example

```bash
GET /api/blog_posts?filters[title][$contains]=Next.js&filters[views][$gte]=100&filters[status][$eq]=published
```

---

## 📦 Architecture

### Core Components

```
src/lib/api/
├── dynamic-content-service.ts   → Generic CRUD service
│
src/app/api/
├── [collection]/
│   ├── route.ts                 → List & Create
│   └── [id]/
│       ├── route.ts             → Get, Update, Delete
│       └── actions/
│           └── route.ts         → Publish/Unpublish
│
src/types/
└── dynamic-content.ts           → TypeScript types
```

### Service Layer (`DynamicContentService`)

The service handles all business logic:
- ✅ Query building with filters
- ✅ Pagination
- ✅ Sorting
- ✅ Field validation
- ✅ i18n support
- ✅ Status management (draft/published/archived)

**Example Usage:**
```typescript
import { createDynamicContentServiceByName } from '@/lib/api/dynamic-content-service';

const service = await createDynamicContentServiceByName('blog_posts');

// Find with filters
const result = await service.find({
  filters: {
    title: { $contains: 'Next.js' },
    status: 'published',
  },
  pagination: { page: 1, pageSize: 10 },
  sort: ['createdAt:desc'],
  locale: 'en',
});

// Create
const post = await service.create({
  title: 'My Post',
  content: 'Hello',
});

// Update
await service.update(post.id, {
  title: 'Updated Title',
});

// Publish
await service.setStatus(post.id, 'published');

// Delete
await service.delete(post.id);
```

---

## 🎨 Field Types & Storage

All field data is stored in JSONB (`data` column) for maximum flexibility.

### Supported Field Types

| Type | Description | Stored As |
|------|-------------|-----------|
| `text` | Short text | string |
| `richtext` | HTML content | string |
| `email` | Email address | string |
| `number` | Integer | number |
| `decimal` | Float | number |
| `date` | Date picker | string (ISO) |
| `datetime` | Date + time | string (ISO) |
| `boolean` | Checkbox | boolean |
| `enumeration` | Dropdown | string |
| `media` | File upload | string (UUID) |
| `relation` | Link to another type | string/array (UUID) |
| `component` | Reusable group | object |
| `json` | Raw JSON | object |
| `uid` | Auto slug | string |

---

## 🌍 Multi-Language (i18n)

Content types support translations out of the box.

### How It Works

1. Mark fields as `translatable: true`
2. Base data stored in `dynamic_content.data`
3. Translations stored in `dynamic_content_translations`

### API Usage

**Create with translations:**
```json
POST /api/blog_posts
{
  "data": {
    "slug": "my-post",
    "views": 0
  },
  "translations": [
    {
      "language_code": "en",
      "data": {
        "title": "My Post",
        "content": "Hello"
      }
    },
    {
      "language_code": "pt",
      "data": {
        "title": "Meu Post",
        "content": "Olá"
      }
    }
  ]
}
```

**Fetch with locale:**
```bash
GET /api/blog_posts/123?locale=pt
```

Response will merge translation data into main `data` object.

---

## 📊 Examples

### Example 1: Blog System

```typescript
// Create blog_posts content type
const blogType = await fetch('/api/content-types', {
  method: 'POST',
  body: JSON.stringify({
    name: 'blog_posts',
    display_name: 'Blog Posts',
    singular_name: 'Blog Post',
    publishable: true,
  }),
});

// Add fields
await fetch(`/api/content-types/${blogType.id}/fields`, {
  method: 'POST',
  body: JSON.stringify([
    { name: 'title', type: 'text', required: true, translatable: true },
    { name: 'slug', type: 'uid', required: true, unique: true },
    { name: 'content', type: 'richtext', translatable: true },
    { name: 'featured_image', type: 'media' },
    { name: 'views', type: 'number', default_value: '0' },
    { name: 'tags', type: 'json' },
  ]),
});

// Create a post
const post = await fetch('/api/blog_posts', {
  method: 'POST',
  body: JSON.stringify({
    data: {
      title: 'Getting Started with Next.js',
      slug: 'getting-started-nextjs',
      content: '<p>Hello world</p>',
      views: 0,
      tags: ['nextjs', 'react'],
    },
  }),
});

// Publish it
await fetch(`/api/blog_posts/${post.id}/actions`, {
  method: 'POST',
  body: JSON.stringify({ action: 'publish' }),
});

// Fetch published posts
const published = await fetch('/api/blog_posts?publicationState=live&sort=createdAt:desc');
```

### Example 2: E-Commerce Products

```typescript
// Create products content type
const productType = await fetch('/api/content-types', {
  method: 'POST',
  body: JSON.stringify({
    name: 'products',
    display_name: 'Products',
    singular_name: 'Product',
  }),
});

// Add fields
await fetch(`/api/content-types/${productType.id}/fields`, {
  method: 'POST',
  body: JSON.stringify([
    { name: 'name', type: 'text', required: true, translatable: true },
    { name: 'sku', type: 'text', required: true, unique: true },
    { name: 'price', type: 'decimal', required: true },
    { name: 'description', type: 'richtext', translatable: true },
    { name: 'images', type: 'media', options: { multiple: true } },
    { name: 'in_stock', type: 'boolean', default_value: 'true' },
    { name: 'category', type: 'relation', options: { target: 'categories' } },
  ]),
});

// Query products
const products = await fetch(
  '/api/products?filters[in_stock][$eq]=true&filters[price][$lt]=100&sort=price:asc'
);
```

---

## ✅ Validation

The service automatically validates:

1. **Required fields** - Must be present on create
2. **Email format** - Valid email for `email` type
3. **Number ranges** - `min_value` and `max_value`
4. **Text length** - `min_length` and `max_length`
5. **Unique fields** - Database-level uniqueness

Validation errors return `400 Bad Request`:

```json
{
  "error": {
    "message": "Required field \"Title\" is missing",
    "status": 400
  }
}
```

---

## 🔐 Security

- **RLS Policies**: Public can only see `published` content
- **Authentication**: Full access requires `authenticated` role
- **Input Sanitization**: All inputs validated before storage
- **SQL Injection**: Protected by Supabase parameterized queries

---

## 🎯 Migration from Static Collections

Your existing collections (treatments, team, etc.) can stay as-is OR be migrated to the dynamic system.

### Option 1: Keep Both Systems
- Existing collections use current API routes
- New collections use dynamic API
- Gradual migration

### Option 2: Full Migration
1. Create content types for existing collections
2. Migrate data to `dynamic_content` table
3. Update frontend to use new API
4. Remove old tables

---

## 📚 Next Steps

1. **✅ Run the migration**:
   ```bash
   supabase migration up
   ```

2. **Test the API**:
   ```bash
   # Create a test content type
   curl -X POST http://localhost:3000/api/content-types \
     -H "Content-Type: application/json" \
     -d '{"name":"test_items","display_name":"Test Items","singular_name":"Test Item"}'

   # List all content types
   curl http://localhost:3000/api/content-types
   ```

3. **Build the Content Type Builder UI** (next task!)

4. **Create your first dynamic content type** via UI

5. **Start using the API** in your frontend

---

## 🐛 Troubleshooting

### "Content type not found"
- Check the collection name matches exactly
- Content type must be created first

### Validation errors
- Check required fields are present
- Verify field types match schema
- Check min/max constraints

### 500 errors
- Check Supabase connection
- Verify RLS policies
- Check server logs

---

**Status**: ✅ Complete and Ready to Use!
**Last Updated**: October 7, 2025
