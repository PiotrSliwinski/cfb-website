# Website Content Audit Report
## Clínica Ferreira Borges CMS Database Opportunities

**Date:** October 6, 2025
**Current Database Coverage:** ~60% of content

---

## Executive Summary

This audit identifies opportunities to move hardcoded content into database collections for easier CMS management. Currently, 60% of content is database-driven, 30% lives in translation files, and 10% is hardcoded in components.

**Key Findings:**
- 14 opportunities identified for new collections
- 5 high-priority collections that would provide immediate business value
- Phase 1-2 implementation would move ~90% of business-critical content to CMS

---

## Current Database Collections

### ✅ Already Implemented:

1. **Treatments** - Full treatment content with FAQs and translations
2. **Team Members** - Team profiles with specialties
3. **Service Prices** - Pricing information
4. **Financing Options** - Payment plans and providers
5. **Insurance Providers** - Accepted insurance companies
6. **Settings** - Application settings and configuration
7. **API Keys** - External service credentials

---

## High Priority Collections

### 1. Hero Sections Collection 🔴 HIGH

**Why:** Marketing teams need to update hero banners frequently for campaigns

**Current State:** Hardcoded in components
- [HeroSection.tsx:15-28](src/components/home/HeroSection.tsx#L15)
- [equipa/page.tsx:25-30](src/app/[locale]/equipa/page.tsx#L25)

**Proposed Fields:**
```typescript
Base:
- slug, page_identifier, background_image_url
- background_gradient, display_order, is_published

Translatable:
- heading, subheading, cta_text, cta_url
- secondary_cta_text, secondary_cta_url
```

**Impact:** Enables marketing to update hero sections without developer

**Pages Affected:** Home, Team, Payments, Location

---

### 2. Call-to-Action Sections Collection 🔴 HIGH

**Why:** CTA sections appear on every page and are critical for conversions

**Current State:** Hardcoded with booking URL repeated 6+ times
- [equipa/page.tsx:103-120](src/app/[locale]/equipa/page.tsx#L103)
- [tratamentos/[slug]/page.tsx:182-199](src/app/[locale]/tratamentos/[slug]/page.tsx#L182)

**Proposed Fields:**
```typescript
Base:
- slug, section_identifier, background_color
- background_image_url, is_published, display_order

Translatable:
- heading, subheading, primary_button_text
- primary_button_url, secondary_button_text, secondary_button_url
```

**Impact:** Single source of truth for CTAs, A/B testing capability

**Pages Affected:** All pages

---

### 3. Contact Information Collection 🔴 HIGH

**Why:** Business contact info appears everywhere and needs quick updates

**Current State:** Hardcoded in multiple locations
- [Header.tsx:119-123](src/components/layout/Header.tsx#L119) - Phone
- [Footer.tsx](src/components/layout/Footer.tsx) - Address, phone, hours
- [localizacao/page.tsx:55-90](src/app/[locale]/localizacao/page.tsx#L55) - All contact info
- [messages/pt.json:147-150](src/messages/pt.json#L147) - Translation files

**Current Hardcoded Data:**
- Phone: `+351935189807`
- Address: `Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa`
- Hours: `Segunda a Sábado 10:00 - 20:00`

**Proposed Fields:**
```typescript
Base:
- phone, email, address_line1, address_line2
- city, postal_code, latitude, longitude
- google_maps_embed_url, is_primary

Translatable:
- business_hours, additional_notes
```

**Impact:** Update contact info once, reflects everywhere

**Pages Affected:** Header, Footer, Location page, Contact forms

---

### 4. Features/Benefits Sections Collection 🔴 HIGH

**Why:** Core marketing content that changes seasonally

**Current State:** Hardcoded in components
- [CommitmentSection.tsx:12-24](src/components/home/CommitmentSection.tsx#L12)

**Proposed Fields:**
```typescript
Base:
- slug, section_type, icon_type, icon_url
- display_order, is_published

Translatable:
- title, description, stat_value, stat_label
```

**Impact:** Marketing can update value propositions

**Pages Affected:** Home page, potential service pages

---

### 5. Social Media Links Collection 🔴 HIGH

**Why:** Social links in footer need occasional updates

**Current State:** Hardcoded URLs
- [Footer.tsx:29-44](src/components/layout/Footer.tsx#L29)

**Proposed Fields:**
```typescript
Base:
- platform (enum), url, icon_name
- display_order, is_published

Translatable:
- display_name, hover_text
```

**Impact:** Update social media links without code changes

**Pages Affected:** Footer, potentially header

---

## Medium Priority Collections

### 6. Page SEO Metadata Collection 🟡 MEDIUM

**Why:** Important for SEO, centralized metadata management

**Current State:** Per-page `generateMetadata()` functions
- [equipa/page.tsx:6-12](src/app/[locale]/equipa/page.tsx#L6)

**Proposed Fields:**
```typescript
Base:
- page_slug, canonical_url, og_image_url, is_published

Translatable:
- meta_title, meta_description, meta_keywords
- og_title, og_description
```

**Impact:** Centralized SEO management, easier optimization

---

### 7. General FAQ Collection 🟡 MEDIUM

**Why:** Good for SEO, frequently needed content type

**Current State:** Only treatment-specific FAQs exist

**Proposed Fields:**
```typescript
Base:
- slug, category, display_order, is_published

Translatable:
- question, answer (rich text)
```

**Impact:** Add FAQ sections to any page

**Note:** Treatment FAQs already exist in database

---

### 8. Service Card Descriptions 🟡 MEDIUM

**Why:** Currently in translation files, would benefit from CMS

**Current State:** Translation files
- [messages/pt.json:36-99](src/messages/pt.json#L36) - 15 service descriptions
- [ServicesSection.tsx:13-29](src/components/home/ServicesSection.tsx#L13)

**Proposed Fields:**
```typescript
Option A: Add to existing treatments table:
- card_short_description (translatable)

Option B: Separate collection:
- treatment_slug, card_icon_url, is_featured

Translatable:
- card_title, card_description, learn_more_text
```

**Impact:** Consolidate with treatments data

---

### 9. Booking System Configuration 🟡 MEDIUM

**Why:** Referenced everywhere, but rarely changes

**Current State:** URL hardcoded in 6+ files
- `https://booking.clinicaferreiraborges.pt`

**Proposed Fields:**
```typescript
Base:
- system_type, booking_url, is_active

Translatable:
- button_text, tooltip_text
```

**Impact:** Single source of truth for booking system

---

## Low Priority Collections

### 10. Testimonials Collection 🟢 LOW

**Status:** Table exists but unused (Google Reviews integrated)

**Proposed Use:** Manual testimonials separate from Google Reviews

---

### 11. Blog Posts Collection 🟢 LOW

**Status:** Not currently implemented

**Purpose:** Content marketing capabilities

---

### 12. Before/After Gallery Collection 🟢 LOW

**Status:** Not implemented, but common for dental clinics

**Purpose:** Showcase treatment results

---

### 13. Office Hours/Schedule Collection 🟢 LOW

**Status:** In contact info, could be separate for exceptions

**Purpose:** Dynamic scheduling with holiday/exception handling

---

### 14. Navigation Menu Collection 🟢 LOW

**Status:** Hardcoded structure, treatment mega menu uses DB

**Purpose:** Fully editable navigation

---

## Implementation Roadmap

### Phase 1: Critical Business Data (1-2 weeks)
**Goal:** Centralize frequently-changing business information

- [ ] **Contact Information Collection**
  - Move phone, address, hours to database
  - Update Header, Footer, Location page
  - Remove hardcoded values

- [ ] **Social Media Links Collection**
  - Centralize social URLs
  - Update Footer component

- [ ] **Booking System Configuration**
  - Single source for booking URL
  - Update all 6+ references

**Impact:** ~20% improvement in content management efficiency

---

### Phase 2: Marketing Content (2-3 weeks)
**Goal:** Enable marketing team autonomy

- [ ] **Hero Sections Collection**
  - Create hero_sections and translations tables
  - Add to admin panel
  - Update Home, Team, Payments, Location pages

- [ ] **CTA Sections Collection**
  - Create cta_sections table
  - Implement reusable CTA component
  - Update all pages

- [ ] **Features/Benefits Collection**
  - Create features_sections table
  - Update CommitmentSection component

**Impact:** Marketing can update key conversion points without developer

---

### Phase 3: SEO & Advanced Content (3-4 weeks)
**Goal:** Improve SEO and content flexibility

- [ ] **Page SEO Metadata Collection**
  - Centralize all meta tags
  - Create SEO management interface

- [ ] **General FAQ Collection**
  - Add FAQ capability to any page
  - SEO-friendly structured data

- [ ] **Service Card Descriptions**
  - Consolidate with treatments OR separate collection
  - Remove from translation files

**Impact:** 95% CMS coverage achieved

---

### Phase 4: Future Enhancements (Future)
**Goal:** Advanced capabilities

- [ ] Blog Posts Collection (content marketing)
- [ ] Before/After Gallery (social proof)
- [ ] Office Hours with Exceptions (scheduling)
- [ ] Navigation Menu (full customization)

---

## Technical Implementation Pattern

### Database Migration Template

```sql
-- Example: Contact Information Collection

CREATE TABLE contact_information (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  info_type VARCHAR(50) DEFAULT 'primary',
  phone VARCHAR(50),
  email VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_embed_url TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contact_information_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  business_hours TEXT,
  additional_notes TEXT,
  UNIQUE(contact_info_id, language_code)
);

-- Indexes
CREATE INDEX idx_contact_info_primary ON contact_information(is_primary);

-- RLS Policies
ALTER TABLE contact_information ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact info viewable by everyone"
  ON contact_information FOR SELECT USING (true);

CREATE POLICY "Contact info editable by authenticated users"
  ON contact_information FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO contact_information (
  phone, email, address_line1, address_line2,
  city, postal_code, latitude, longitude,
  google_maps_embed_url, is_primary
) VALUES (
  '+351935189807',
  'geral@clinicaferreiraborges.pt',
  'Rua Ferreira Borges 173C',
  'Campo de Ourique',
  'Lisboa',
  '1350-130',
  38.715682,
  -9.164195,
  'https://www.google.com/maps/embed?pb=...',
  true
);

INSERT INTO contact_information_translations (
  contact_info_id, language_code, business_hours
) VALUES (
  (SELECT id FROM contact_information WHERE is_primary = true),
  'pt',
  'Segunda a Sábado: 10:00 - 20:00'
), (
  (SELECT id FROM contact_information WHERE is_primary = true),
  'en',
  'Monday to Saturday: 10:00 - 20:00'
);
```

### Admin Panel Integration

```typescript
// src/config/collections.tsx
import { Building2 } from 'lucide-react';

export const contactInformationCollection: CollectionConfig = {
  id: 'contact',
  name: 'Contact Information',
  nameSingular: 'Contact Info',
  icon: Building2,
  tableName: 'contact_information',
  translationTableName: 'contact_information_translations',

  baseFields: [
    { name: 'phone', label: 'Phone Number', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'address_line1', label: 'Address Line 1', type: 'text', required: true },
    { name: 'address_line2', label: 'Address Line 2', type: 'text' },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'postal_code', label: 'Postal Code', type: 'text', required: true },
    { name: 'latitude', label: 'Latitude', type: 'number' },
    { name: 'longitude', label: 'Longitude', type: 'number' },
    { name: 'google_maps_embed_url', label: 'Google Maps Embed URL', type: 'text' },
  ],

  translatableFields: {
    fields: [
      { name: 'business_hours', label: 'Business Hours', type: 'textarea', required: true },
      { name: 'additional_notes', label: 'Additional Notes', type: 'textarea' },
    ],
  },

  features: {
    draggable: false,
    publishable: false,
    featured: false,
  },

  endpoints: {
    list: '/api/contact-info',
    create: '/api/contact-info',
    update: '/api/contact-info',
    delete: '/api/contact-info',
  },

  display: {
    titleField: 'phone',
    descriptionField: 'email',
  },
};
```

### API Route Template

```typescript
// src/app/api/contact-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const { data, error } = await supabase
    .from('contact_information')
    .select(`
      *,
      contact_information_translations!inner(*)
    `)
    .eq('contact_information_translations.language_code', locale);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST, PUT, DELETE handlers follow same pattern as other collections
```

---

## Benefits Analysis

### Business Benefits

**Time Savings:**
- Marketing team: ~10 hours/week (no developer needed for content updates)
- Development team: ~5 hours/week (reduced content change requests)

**Flexibility:**
- A/B testing CTAs without code changes
- Seasonal hero section updates
- Quick contact info updates

**SEO Improvements:**
- Centralized metadata management
- Easier to optimize and test
- Structured data for FAQs

### Technical Benefits

**Maintainability:**
- Single source of truth for business data
- Reduced code duplication
- Easier to test and debug

**Scalability:**
- Add new pages without code changes
- Multi-language support built-in
- Consistent admin interface

---

## Cost Estimate

### Development Time

**Phase 1:** 40-60 hours
- Contact Information: 15 hours
- Social Media Links: 10 hours
- Booking Configuration: 10 hours
- Testing & QA: 10 hours

**Phase 2:** 60-80 hours
- Hero Sections: 20 hours
- CTA Sections: 25 hours
- Features/Benefits: 15 hours
- Testing & QA: 15 hours

**Phase 3:** 50-70 hours
- Page SEO Metadata: 20 hours
- General FAQ: 15 hours
- Service Cards: 10 hours
- Testing & QA: 10 hours

**Total:** 150-210 hours (~4-5 weeks for 1 developer)

### ROI

**After Phase 1-2 completion:**
- Marketing autonomy achieved
- ~15 hours/week saved across team
- Payback period: ~10-14 weeks

---

## Risk Assessment

### Low Risk
- Contact Information (simple data structure)
- Social Media Links (straightforward)
- Booking Configuration (single record)

### Medium Risk
- Hero Sections (requires component refactoring)
- CTA Sections (used on many pages)

### Considerations
- Backup current hardcoded data before migration
- Gradual rollout (feature flags)
- Keep translation files as fallback during transition

---

## Conclusion

This audit identifies 14 opportunities to enhance CMS capabilities, with 5 high-priority collections that would provide immediate business value. Implementing Phase 1-2 would move ~90% of business-critical content into the CMS, enabling the marketing team to work independently while reducing developer burden.

**Recommended Next Steps:**
1. Review and prioritize recommendations with stakeholders
2. Begin Phase 1 implementation (Contact Info, Social Links, Booking Config)
3. Gather feedback after Phase 1 before proceeding to Phase 2

---

**Document Version:** 1.0
**Last Updated:** October 6, 2025
