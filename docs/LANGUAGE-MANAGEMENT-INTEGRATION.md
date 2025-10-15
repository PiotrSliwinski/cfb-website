# Language Management System Integration

## Overview

The language management system has been successfully integrated with your existing i18n setup. Languages are now managed dynamically through the admin panel at `/admin/settings/languages` and automatically sync with your Next.js internationalization system.

## What Was Changed

### 1. Database-Driven Language Configuration

**Files Modified:**
- `src/lib/i18n/config.ts` - Now fetches languages from database with caching
- `src/middleware.ts` - Uses dynamic locales from database
- `src/lib/i18n/request.ts` - Validates against database languages

**How It Works:**
- Languages are stored in the `supported_languages` database table
- Functions like `getLocales()` and `getDefaultLocaleValue()` fetch from database
- 1-minute cache prevents excessive database queries
- Falls back to hardcoded `['pt', 'en']` if database is unavailable

### 2. Client-Side Language Switcher

**File Modified:**
- `src/components/layout/LanguageSwitcher.tsx`

**Changes:**
- Now fetches languages via `/api/admin/languages` API endpoint
- Displays language flags from database
- Only shows enabled languages
- Respects display_order from database
- Falls back to default pt/en if API fails

### 3. Cache Invalidation

**Files Modified:**
- `src/app/api/admin/languages/route.ts`
- `src/app/api/admin/languages/[id]/route.ts`

**Implementation:**
- Calls `clearLocaleCache()` after any language create/update/delete
- Ensures middleware and i18n system pick up changes within 1 minute

## How to Use

### Step 1: Run Database Migrations

Before the language management system will work, you must create the `supported_languages` table:

```bash
npx supabase db push
```

This will:
- Create the `supported_languages` table
- Seed it with Portuguese (default) and English
- Set up unique constraints for the default language

### Step 2: Access the Language Admin Panel

Visit: **http://localhost:3002/admin/settings/languages**

Or navigate through the admin dashboard → "Languages" quick action

### Step 3: Add a New Language

1. Click "Add New Language"
2. Fill in the form:
   - **Language Code**: 2-10 lowercase letters (e.g., `fr`, `es`, `de`)
   - **English Name**: Name in English (e.g., `French`)
   - **Native Name**: Name in native language (e.g., `Français`)
   - **Flag Emoji**: Flag icon (e.g., `🇫🇷`)
   - **Display Order**: Number for sorting (lower = earlier)
   - **Enabled**: Whether language should appear on site
   - **Is Default**: Whether this should be the default language (only one allowed)

3. Click "Save"

### Step 4: Create Translation File

After adding a new language:

1. Click the file icon (📄) next to the language
2. This will create a new file at `src/messages/{language_code}.json`
3. The file is pre-populated with all keys from the default language
4. Translate the values to the new language

Example created file (`src/messages/fr.json`):
```json
{
  "_metadata": {
    "language_code": "fr",
    "language_name": "French",
    "created_from": "pt",
    "created_at": "2025-10-15T15:00:00.000Z",
    "note": "This file was auto-generated. Please translate all values to Français"
  },
  "nav": {
    "practice": {
      "title": "Practice",
      ...
    }
  }
}
```

### Step 5: Verify Integration

1. Visit your website homepage
2. Check the language switcher in the header
3. You should see your new language with its flag
4. Click to switch - the URL should change to `/{language_code}/`
5. Content should display in the new language (once translated)

## Architecture

### Data Flow

```
User Action (Add/Edit Language)
  ↓
API Route (/api/admin/languages)
  ↓
Supabase Query (languages.ts)
  ↓
Database (supported_languages table)
  ↓
clearLocaleCache() called
  ↓
Middleware cache refreshes (within 1 min)
  ↓
i18n system picks up new language
  ↓
LanguageSwitcher re-fetches and displays new language
```

### Caching Strategy

**Server-Side Cache** (in `src/lib/i18n/config.ts`):
- Duration: 60 seconds
- Scope: Per-process (Node.js runtime)
- Cleared on: Language create/update/delete via API

**Middleware Cache** (in `src/middleware.ts`):
- Duration: 60 seconds
- Scope: Per-middleware invocation
- Refreshed automatically after cache expiry

**Client-Side Fetching** (in `LanguageSwitcher.tsx`):
- No caching - fetches on component mount
- Could add React Query or SWR for client-side caching if needed

## Database Schema

```sql
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

-- Unique constraint: Only one default language allowed
CREATE UNIQUE INDEX idx_one_default_language
  ON supported_languages (is_default)
  WHERE is_default = true;
```

## API Endpoints

### GET /api/admin/languages
Returns all languages (enabled and disabled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "pt",
      "name": "Portuguese",
      "native_name": "Português",
      "flag": "🇵🇹",
      "enabled": true,
      "is_default": true,
      "display_order": 1,
      "created_at": "2025-10-15T12:00:00Z",
      "updated_at": "2025-10-15T12:00:00Z"
    }
  ]
}
```

### POST /api/admin/languages
Creates a new language

**Request Body:**
```json
{
  "code": "fr",
  "name": "French",
  "native_name": "Français",
  "flag": "🇫🇷",
  "enabled": true,
  "is_default": false,
  "display_order": 3
}
```

### PUT /api/admin/languages/[id]
Updates an existing language

### DELETE /api/admin/languages/[id]
Deletes a language (cannot delete default language)

### POST /api/admin/translations/create
Creates a translation file for a language

**Request Body:**
```json
{
  "language_code": "fr"
}
```

## Troubleshooting

### Language switcher not showing new language

**Cause:** Cache hasn't refreshed yet
**Solution:** Wait up to 60 seconds or restart the dev server

### Translation file not found error

**Cause:** Translation file wasn't created for the language
**Solution:** Click the file icon in the admin panel or manually create `src/messages/{code}.json`

### Database table not found error

**Cause:** Migrations haven't been run
**Solution:** Run `npx supabase db push`

### "Cannot set two default languages" error

**Cause:** Trying to set a second language as default
**Solution:** The system automatically unsets the previous default. This error shouldn't occur, but if it does, manually update the database

### Client/server component boundary error

**Cause:** Import chain trying to use server-side code in client components
**Solution:** The dynamic imports in `config.ts` should prevent this. If it persists, check that `LanguageSwitcher` only uses the API endpoint, not server-side query functions

## Backward Compatibility

The system maintains full backward compatibility:

- Static exports `locales`, `defaultLocale`, and `localeNames` still exist in `config.ts`
- These serve as fallbacks if database is unavailable
- Existing code using these exports will continue to work
- Migration to dynamic system is transparent to other components

## Future Enhancements

Possible improvements for the future:

1. **Translation Progress Tracking**: Show completion percentage for each language
2. **In-Admin Translation Editor**: Edit translations directly in admin panel
3. **Language Import/Export**: Bulk import/export translation files
4. **Auto-Translation**: Integration with translation APIs (Google Translate, DeepL)
5. **RTL Support**: Add right-to-left language support
6. **Dialect Support**: Support for regional variants (e.g., pt-BR vs pt-PT)
7. **Content-Specific Languages**: Enable/disable languages per page or content type

## Testing Checklist

Before deploying to production:

- [ ] Run database migrations successfully
- [ ] Verify default languages (pt, en) appear in admin panel
- [ ] Add a new language via admin panel
- [ ] Create translation file for new language
- [ ] Verify new language appears in website language switcher
- [ ] Test switching between languages on frontend
- [ ] Verify URL changes correctly (/{locale}/...)
- [ ] Test disabling a language (should disappear from switcher)
- [ ] Test changing default language
- [ ] Verify cache invalidation works (changes appear within 1 minute)
- [ ] Test deleting a language (except default)
- [ ] Verify fallback behavior when database is unavailable

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the server logs for database errors
3. Verify migrations have been applied: `npx supabase db pull`
4. Check that Supabase connection is working
5. Review the [audit document](../AUDIT-AND-IMPROVEMENTS.md) for architecture details
