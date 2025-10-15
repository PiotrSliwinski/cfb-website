# Admin Panel Structure
**Last Updated:** October 6, 2025

## Overview

The admin panel at `/[locale]/admin` provides a comprehensive CMS for managing all website content. It's organized into three main sections: **Collections**, **Configuration**, and content is fully multilingual (Portuguese/English).

---

## Panel Organization

### 📊 Collections Section

Content collections with CRUD operations, drag-and-drop reordering, and publish toggles:

#### **1. Treatments** (9 records)
- Full treatment information with FAQs
- Fields: title, subtitle, description, benefits, process steps, hero image, icon
- Features: Featured flag, multilingual, drag-and-drop
- **Route:** `/api/treatments`

#### **2. Team Members** (9 records)
- Staff profiles with specialties
- Fields: name, title, credentials, bio, photo, specialties
- Features: Multilingual, drag-and-drop
- **Route:** `/api/team`

#### **3. Service Prices** (6 records)
- Pricing information for services
- Fields: title, description, price range (from/to)
- Features: Multilingual, drag-and-drop, publish toggle
- **Route:** `/api/prices`

#### **4. Financing Options** (2 records)
- Payment plan providers (Cetelem, Cofidis)
- Fields: provider name, logo, amounts, installments, interest rate, terms
- Features: Multilingual, drag-and-drop, publish toggle
- **Route:** `/api/financing`

#### **5. Insurance Providers** (3 records)
- Accepted insurance companies (Medis, AdvanceCare, Multicare)
- Fields: name, logo, description, coverage details, contact info
- Features: Multilingual, drag-and-drop, publish toggle
- **Route:** `/api/insurance`

#### **6. Contact Information** (1 record)
- Clinic contact details
- Fields: phone, email, address, postal code, Google Maps embed URL
- Translatable: business_hours, additional_notes
- **Route:** `/api/contact-info`
- **Replaces:** Legacy `settings.contact.*` (removed)

#### **7. Social Media Links** (2 records)
- Social media profiles (Facebook, Instagram)
- Fields: platform, URL, icon name, display order
- Translatable: display_name, hover_text
- Features: Drag-and-drop, publish toggle
- **Route:** `/api/social-media`
- **Replaces:** Legacy `settings.social.*` (removed)

#### **8. Hero Sections** (4 records)
- Page hero/banner sections
- Fields: slug, page_identifier, background_image_url, background_gradient
- Translatable: heading, subheading, CTA text/URL, secondary CTA
- Features: Drag-and-drop, publish toggle
- **Route:** `/api/hero-sections`
- **Pages:** home, team, payments, location

#### **9. CTA Sections** (4 records)
- Call-to-action sections
- Fields: slug, section_identifier, background_color, background_image_url
- Translatable: heading, subheading, primary/secondary button text/URL
- Features: Drag-and-drop, publish toggle
- **Route:** `/api/cta-sections`
- **Locations:** team-bottom, payments-bottom, treatment-bottom, general-booking

---

### ⚙️ Configuration Section

System-wide settings and API integrations:

#### **10. Settings**
Application configuration organized by category:

**Categories:**
- **api** (3 settings): timeout, retryAttempts, retryDelay
- **app** (3 settings): name, defaultLocale, supportedLocales
- **features** (4 settings): enableAdmin, enableBlog, enableBooking, enableReviews
- **google** (3 settings): analyticsId, mapsApiKey, reviewsPlaceId
- **seo** (3 settings): metaTitle, metaDescription, keywords
- **storage** (4 settings): maxImageSize, maxIconSize, allowedImageTypes, allowedIconTypes

**Total:** 20 settings across 6 categories

**Note:** Contact and social settings were migrated to dedicated collections

#### **11. API Keys**
External service credentials:

- Google Places API
- Google Analytics
- Google Maps
- Future: Other third-party integrations

**Fields:** service, key, environment, is_active

---

## Summary Statistics

### Content Coverage
- **Collections:** 9 (all content types)
- **Total Records:** 38
- **Configuration Settings:** 20
- **API Keys:** Variable
- **CMS Coverage:** ~95% (up from 60% pre-implementation)

### By Section
**Collections:**
- Treatments: 9
- Team: 9
- Prices: 6
- Financing: 2
- Insurance: 3
- Contact Info: 1
- Social Links: 2
- Heroes: 4
- CTAs: 4

**Configuration:**
- Settings: 20
- API Keys: 3+

---

## Features Overview

### ✅ Implemented Features

**All Collections:**
- ✅ Multilingual (Portuguese/English)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Search/filter functionality
- ✅ Consistent UI via CollectionManager component

**Most Collections:**
- ✅ Drag-and-drop reordering
- ✅ Publish/unpublish toggle
- ✅ Display order management

**Some Collections:**
- ✅ Featured flag (Treatments only)
- ✅ Rich content (FAQs for Treatments)

### Database Features
- ✅ Row Level Security (RLS)
- ✅ Public read access
- ✅ Authenticated admin write access
- ✅ Cascade delete for translations
- ✅ Automatic timestamps
- ✅ Optimized indexes

---

## User Workflow

### Adding New Content

1. **Navigate to Collection:** Click collection in sidebar
2. **Create Entry:** Click "Create new entry" button
3. **Fill Form:**
   - Enter base fields (slug, URLs, order, etc.)
   - Switch language tabs (PT/EN) for translations
4. **Save:** Submit form to create record
5. **Reorder:** Drag-and-drop to adjust display order (if enabled)
6. **Publish:** Toggle publish status to show/hide on website

### Editing Content

1. **Find Entry:** Use search or browse list
2. **Click Edit:** Click edit icon on desired record
3. **Update Fields:** Modify as needed
4. **Save Changes:** Submit to update

### Managing Order

1. **Drag Handle:** Click and hold the drag handle (≡) on left side
2. **Drag:** Move row to desired position
3. **Drop:** Release to set new order
4. **Auto-Save:** Order updates automatically

---

## Technical Architecture

### Components

**Main:**
- `/src/app/[locale]/admin/page.tsx` - Admin panel container
- `/src/components/admin/CollectionManager.tsx` - Generic collection UI
- `/src/components/admin/CollectionEditor.tsx` - Form modal
- `/src/components/admin/SettingsEditor.tsx` - Settings UI
- `/src/components/admin/APIKeysEditor.tsx` - API keys UI

**Supporting:**
- `/src/components/admin/SortableTableRow.tsx` - Drag-and-drop rows
- `/src/hooks/useCollection.tsx` - Collection data hook

### Configuration

**Collections:** `/src/config/collections.tsx`

Each collection defined with:
- Table names
- Field definitions
- Features (draggable, publishable, featured)
- API endpoints
- Display configuration

### API Routes

**Pattern:** `/src/app/api/[collection]/route.ts`

Standard endpoints for each collection:
- `GET /?locale=en` - List all (filtered by locale)
- `POST /` - Create new record
- `PUT /` - Update existing record
- `DELETE /?id=uuid` - Delete record
- `POST /publish` - Toggle publish status (if publishable)
- `POST /reorder` - Update display order (if draggable)

### Database Schema

**Main Tables:**
```sql
collection_name (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  display_order INTEGER,
  is_published BOOLEAN,
  is_featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- Collection-specific fields
)
```

**Translation Tables:**
```sql
collection_name_translations (
  id UUID PRIMARY KEY,
  collection_id UUID REFERENCES collection_name(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  -- Translatable fields
  UNIQUE(collection_id, language_code)
)
```

---

## Migration History

### Collections Implementation
1. `20251005225300` - Treatments
2. `20251005230109` - Team Members
3. `20251006130000` - Settings
4. `20251006140000` - API Keys
5. `20251006150000` - Payment Options (Financing)
6. `20251006160000` - Service Prices
7. `20251006170000` - Insurance Providers
8. `20251006180000` - Contact Information
9. `20251006180100` - Social Media Links
10. `20251006180200` - Hero Sections
11. `20251006180300` - CTA Sections
12. `20251006180400` - Remove Duplicate Settings

---

## Changelog

### October 6, 2025 - Phase 1 & 2 Complete
**Added:**
- Contact Information collection (replaces settings.contact.*)
- Social Media Links collection (replaces settings.social.*)
- Hero Sections collection (4 page heroes)
- CTA Sections collection (4 call-to-actions)

**Changed:**
- Moved Hero/CTA from "Content" to "Collections" section
- Renamed "General" section to "Configuration"
- Deleted duplicate contact.* and social.* settings
- Updated settings table to only include app config

**Impact:**
- CMS coverage increased from 60% to 95%
- Reduced settings table from 27 to 20 records
- All business-critical content now database-driven
- Marketing team can work independently

---

## Best Practices

### Content Guidelines

1. **Slugs:** Use lowercase, hyphens only (e.g., `dental-cleaning`)
2. **Display Order:** Start at 1, increment by 1
3. **Translations:** Always fill both PT and EN
4. **Images:** Use absolute URLs (https://...)
5. **Publishing:** Test in draft before publishing

### Maintenance

1. **Backups:** Database automatically backed up
2. **Testing:** Test changes in draft mode first
3. **Ordering:** Maintain logical display order
4. **Deletion:** Cascade deletes remove translations automatically
5. **Search:** Use search to find records quickly

---

## Future Enhancements

### Phase 3 Candidates
- Page SEO Metadata Collection
- General FAQ Collection
- Blog Posts Collection

### Phase 4 Candidates
- Before/After Gallery
- Office Hours with Exceptions
- Navigation Menu Builder
- Media Library

---

**Document Version:** 1.0
**Maintained By:** Development Team
**Last Review:** October 6, 2025
