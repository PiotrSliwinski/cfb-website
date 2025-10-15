# Generic Collection Management System

This document describes the new reusable collection management system that makes it easy to add new admin collections with consistent UX/UI.

## Overview

The system provides a complete CRUD interface for managing database collections with features like:
- Tab-based multilingual editing (PT/EN)
- Drag-and-drop reordering
- Publish/unpublish toggles
- Featured items support
- Searchable list views
- Consistent UI/UX across all collections

## Architecture

### 1. Type Definitions (`src/types/admin.ts`)

Defines the core types for the system:
- `FieldConfig` - Configuration for form fields
- `CollectionConfig` - Complete collection configuration
- `CollectionItem` - Generic item interface
- `Translation` - Multilingual content interface

### 2. Collection Configurations (`src/config/collections.tsx`)

Each collection is configured with:
- **Metadata**: Name, icon, table names
- **Fields**: Base fields (non-translatable) and translatable fields
- **Features**: Draggable, publishable, featured toggles
- **Endpoints**: API routes for CRUD operations
- **Display**: How to show items in lists

Example:
```typescript
export const servicePricesCollection: CollectionConfig = {
  id: 'prices',
  name: 'Service Prices',
  nameSingular: 'Service Price',
  icon: Tag,
  tableName: 'service_prices',
  translationTableName: 'service_price_translations',

  baseFields: [
    {
      name: 'slug',
      label: 'Slug (URL identifier)',
      type: 'slug',
      required: true,
    },
    // ... more fields
  ],

  translatableFields: {
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
      },
      // ... more fields
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/prices',
    create: '/api/prices',
    update: '/api/prices',
    delete: '/api/prices',
    togglePublish: '/api/prices/publish',
    reorder: '/api/prices/reorder',
  },

  display: {
    titleField: 'title',
    descriptionField: 'description',
  },
};
```

### 3. Reusable Components

#### CollectionManager (`src/components/admin/CollectionManager.tsx`)
Main component that handles:
- Loading items from API
- Displaying items in a sortable table
- Search functionality
- Opening editors for create/edit
- Delete confirmations
- Drag-and-drop reordering

Usage:
```typescript
import { CollectionManager } from '@/components/admin/CollectionManager';
import { servicePricesCollection } from '@/config/collections';

<CollectionManager config={servicePricesCollection} />
```

#### CollectionEditor (`src/components/admin/CollectionEditor.tsx`)
Modal editor with:
- Language tabs (PT/EN) for translatable fields
- Form validation
- Save/cancel actions
- Error handling

#### FormField (`src/components/admin/FormField.tsx`)
Renders different field types:
- `text` - Single line text input
- `textarea` - Multi-line text
- `number` - Integer input
- `decimal` - Decimal number input
- `checkbox` - Boolean toggle
- `select` - Dropdown selection
- `slug` - URL-friendly text input

### 4. useCollection Hook (`src/hooks/useCollection.ts`)

Custom hook that provides:
```typescript
const {
  items,
  loading,
  error,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  togglePublish,
  toggleFeatured,
  reorderItems,
} = useCollection(config);
```

## Adding a New Collection

To add a new collection to the admin panel:

###  1. Create Database Tables

```sql
-- Main table
CREATE TABLE my_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Translation table (if needed)
CREATE TABLE my_collection_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  my_collection_id UUID REFERENCES my_collection(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  UNIQUE(my_collection_id, language_code)
);
```

### 2. Create Collection Configuration

In `src/config/collections.tsx`:

```typescript
import { Star } from 'lucide-react';

export const myCollection: CollectionConfig = {
  id: 'my-collection',
  name: 'My Collection',
  nameSingular: 'Item',
  icon: Star,
  tableName: 'my_collection',
  translationTableName: 'my_collection_translations',

  baseFields: [
    {
      name: 'slug',
      label: 'Slug',
      type: 'slug',
      required: true,
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/my-collection',
    create: '/api/my-collection',
    update: '/api/my-collection',
    delete: '/api/my-collection',
    togglePublish: '/api/my-collection/publish',
    reorder: '/api/my-collection/reorder',
  },

  display: {
    titleField: 'title',
    descriptionField: 'description',
  },
};

// Add to registry
export const collections: Record<string, CollectionConfig> = {
  // ... existing collections
  'my-collection': myCollection,
};
```

### 3. Create API Route

In `src/app/api/my-collection/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('my_collection')
    .select(`
      *,
      my_collection_translations!inner(*)
    `)
    .eq('my_collection_translations.language_code', locale)
    .order('display_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // Create new item
  const formData = await request.formData();
  // ... implementation
}

// ... PUT, DELETE methods
```

### 4. Add to Admin Panel

In `src/app/[locale]/admin/page.tsx`:

```typescript
import { CollectionManager } from '@/components/admin/CollectionManager';
import { myCollection } from '@/config/collections';

// Add tab button in sidebar
<button
  onClick={() => setActiveTab('my-collection')}
  className={`...`}
>
  <myCollection.icon className="w-5 h-5" />
  <span>{myCollection.name}</span>
</button>

// Add tab content
{activeTab === 'my-collection' && (
  <CollectionManager config={myCollection} />
)}
```

Done! Your new collection now has:
- ✅ Create/Read/Update/Delete operations
- ✅ Multilingual editing with language tabs
- ✅ Drag-and-drop reordering
- ✅ Publish/unpublish toggle
- ✅ Search functionality
- ✅ Consistent UI matching other collections

## Field Types Reference

### text
```typescript
{
  name: 'name',
  label: 'Name',
  type: 'text',
  required: true,
  placeholder: 'Enter name...',
  hint: 'This will be displayed publicly',
}
```

### textarea
```typescript
{
  name: 'description',
  label: 'Description',
  type: 'textarea',
  required: false,
  placeholder: 'Enter description...',
}
```

### number
```typescript
{
  name: 'order',
  label: 'Display Order',
  type: 'number',
  required: true,
  min: 0,
  max: 100,
}
```

### decimal
```typescript
{
  name: 'price',
  label: 'Price (€)',
  type: 'decimal',
  required: true,
  min: 0,
  step: 0.01,
}
```

### checkbox
```typescript
{
  name: 'featured',
  label: 'Featured',
  type: 'checkbox',
}
```

### select
```typescript
{
  name: 'status',
  label: 'Status',
  type: 'select',
  required: true,
  options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ],
}
```

### slug
```typescript
{
  name: 'slug',
  label: 'URL Slug',
  type: 'slug',
  required: true,
  hint: 'Use lowercase letters, numbers, and hyphens only',
}
```

## Benefits

1. **Consistency**: All collections share the same UX/UI patterns
2. **Speed**: Add new collections in minutes, not hours
3. **Maintainability**: Changes to the system benefit all collections
4. **Type Safety**: TypeScript ensures correct configuration
5. **Flexibility**: Easy to extend with new field types or features
6. **Multilingual**: Built-in support for PT/EN translations
7. **Best Practices**: Drag-and-drop, search, validation out of the box

## Migration Guide

To migrate existing collections (like Service Prices and Financing Options):

1. Create collection configuration in `src/config/collections.tsx`
2. Replace custom editors with `<CollectionManager config={config} />`
3. Remove redundant state management code
4. Remove custom CRUD handlers
5. Test all CRUD operations

The new system reduces code by ~70% while adding more features!
