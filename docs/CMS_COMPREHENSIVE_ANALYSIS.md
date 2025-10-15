# Comprehensive CMS Analysis for Clínica Ferreira Borges Website

**Project:** Clínica Ferreira Borges - Dental Clinic Website
**Analysis Date:** October 7, 2025
**Current CMS Coverage:** ~60% (Database-driven)
**Target CMS Coverage:** 95%+ (Fully CMS-driven)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Complete Page Inventory](#complete-page-inventory)
4. [Content Distribution Analysis](#content-distribution-analysis)
5. [Recommended Database Schema](#recommended-database-schema)
6. [Generic CMS Page System Design](#generic-cms-page-system-design)
7. [Migration Strategy](#migration-strategy)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Current Architecture

The Clínica Ferreira Borges website is a **Next.js 14** application with **i18n (Portuguese/English)** support, using **Supabase** as the backend database. The project demonstrates a **hybrid content management approach**:

- **60% Database-Driven**: Treatments, team members, pricing, financing options
- **30% Translation Files**: Static page content, labels, common UI elements
- **10% Hardcoded**: Component-level content, configuration

### Key Findings

1. **8 Main Pages** identified, each with distinct content structures
2. **15+ Content Section Types** currently in use (hero, features, FAQs, CTAs, etc.)
3. **Strong foundation** already exists with treatments and team management
4. **Clear opportunities** to move 90% of content to CMS with proposed schema

### Strategic Recommendation

**Move to a flexible, section-based CMS architecture** that allows:
- Marketing team autonomy for content updates
- Easy creation of new pages without code changes
- Consistent admin interface across all content types
- Multilingual support built into every aspect

---

## Current State Analysis

### What's Already in Database ✅

| Collection | Tables | Multilingual | Status |
|------------|--------|--------------|--------|
| **Treatments** | treatments, treatment_translations, treatment_faqs | ✅ Yes | Fully Implemented |
| **Team Members** | team_members, team_member_translations, team_member_specialties | ✅ Yes | Fully Implemented |
| **Service Prices** | service_prices, service_price_translations | ✅ Yes | Fully Implemented |
| **Financing Options** | financing_options, financing_option_translations | ✅ Yes | Fully Implemented |
| **Insurance Providers** | insurance_providers, insurance_provider_translations | ✅ Yes | Fully Implemented |
| **Hero Sections** | hero_sections, hero_section_translations | ✅ Yes | Partially Implemented |
| **CTA Sections** | cta_sections, cta_section_translations | ✅ Yes | Partially Implemented |
| **Settings** | site_settings, site_setting_translations | ✅ Yes | Basic Implementation |

### What's in Translation Files 📝

Location: `/src/messages/pt.json` and `/src/messages/en.json`

**Content Categories:**
1. **Navigation** (lines 8-33): Menu labels, navigation structure
2. **Home Page Sections** (lines 34-248):
   - Hero section text
   - Services grid (15 treatment descriptions)
   - Commitment section
   - Certifications (6 badges with descriptions)
   - Safety protocols (6 items)
   - Team credentials (4 sections + stats)
   - FAQs (6 questions/answers)
3. **Common Elements** (lines 2-7): Button labels, common CTAs
4. **Footer** (lines 290-314): Contact info, regulatory info, hours
5. **Page-Specific Content**:
   - Payments page labels
   - Team page labels
   - Contact page labels
   - Treatment detail page labels

### What's Hardcoded 💻

**Component-Level Hardcoded Content:**

1. **Contact Information** (appears in 5+ files):
   ```
   Phone: +351935189807
   Email: geral@clinicaferreiraborges.pt
   Address: Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa
   Hours: Monday-Saturday 10:00-20:00
   ```

2. **Booking System URL** (appears in 10+ files):
   ```
   https://booking.clinicaferreiraborges.pt
   ```

3. **Social Media Links** (Footer component):
   - Facebook, Instagram, Google Business profile URLs

4. **Regulatory Information** (Footer + legal pages):
   - ERS Number: 25393
   - Establishment: E128470
   - License: 10984/2015

5. **Terms & Conditions Content** (termos-condicoes/page.tsx):
   - Entire legal text hardcoded in Portuguese and English

---

## Complete Page Inventory

### 1. Home Page (`/[locale]/page.tsx`)

**Route:** `/` (pt), `/en` (en)
**Component:** Composition of sections
**Sections:**

| Section | Type | Current Source | Lines | CMS Priority |
|---------|------|----------------|-------|--------------|
| Hero | Banner | Component | 1-15 | 🔴 High |
| Certification Badges | Stats Grid | Component | 16 | 🟡 Medium |
| Services Grid | Cards | Database (treatments) | 17 | ✅ Done |
| Safety Section | Feature Grid | Translation File | 18 | 🟡 Medium |
| Team Credentials | Info + Stats | Translation File | 19 | 🟡 Medium |
| Commitment | Text Block | Translation File | 20 | 🟡 Medium |
| Google Reviews | Dynamic | Google API | 21 | ✅ Done |
| FAQs | Accordion | Translation File | 22 | 🟢 Low |

**Translation File Usage:**
- `home.hero.*` (lines 35-41)
- `home.services.*` (lines 42-109)
- `home.commitment.*` (lines 110-114)
- `home.certifications.*` (lines 116-143)
- `home.safety.*` (lines 145-174)
- `home.teamCredentials.*` (lines 176-218)
- `home.faqs.*` (lines 219-247)

**Opportunities:**
- Move hero to database (hero_sections table exists but not used)
- Create generic "feature_sections" for Safety, Team Credentials, Commitment
- Create "certification_badges" table for stats
- Create "faq_sections" for general FAQs

---

### 2. Team Page (`/[locale]/equipa/page.tsx`)

**Route:** `/equipa` (pt), `/en/team` (en)
**Component:** Database-driven with hardcoded structure
**Sections:**

| Section | Type | Current Source | CMS Priority |
|---------|------|----------------|--------------|
| Hero | Banner | Hardcoded + Translation | 🔴 High |
| Team Grid | Cards | Database (team_members) | ✅ Done |
| CTA Section | Call-to-action | Hardcoded | 🔴 High |

**Translation File Usage:**
- `team.label`, `team.title`, `team.subtitle` (lines 357-360)
- `team.specialties` (line 360)
- `team.cta.*` (lines 361-364)

**Database Tables Used:**
- `team_members` - Photos, display order, contact
- `team_member_translations` - Names, titles, credentials, bio
- `team_member_specialties` - Junction table linking to treatments

**Opportunities:**
- Move hero to hero_sections table
- Create reusable CTA component from cta_sections table

---

### 3. Technology Page (`/[locale]/tecnologia/page.tsx`)

**Route:** `/tecnologia` (pt), `/en/technology` (en)
**Component:** Translation-driven
**Sections:**

| Section | Type | Current Source | CMS Priority |
|---------|------|----------------|--------------|
| Hero | Banner | Hardcoded + Translation | 🔴 High |
| Main Technologies (3) | Feature Cards | Translation File | 🟡 Medium |
| Additional Tech (3) | Small Cards | Translation File | 🟡 Medium |
| Trust Statement | Quote | Translation File | 🟢 Low |
| CTA Section | Call-to-action | Hardcoded | 🔴 High |

**Translation File Usage:**
- `technology.label`, `technology.title`, `technology.subtitle` (lines 622-624)
- `technology.intraoralScanner.*` (lines 625-632)
- `technology.cbct.*` (lines 633-640)
- `technology.smileDesign.*` (lines 641-648)
- `technology.digitalRadiology.*` (lines 654-656)
- `technology.microscopy.*` (lines 657-659)
- `technology.photography.*` (lines 661-663)
- `technology.trustStatement` (line 665)
- `technology.cta.*` (lines 666-669)

**Opportunities:**
- Create "technology_items" table for equipment/technology showcase
- Reuse hero_sections and cta_sections tables

---

### 4. Payments Page (`/[locale]/pagamentos/page.tsx`)

**Route:** `/pagamentos` (pt), `/en/payments` (en)
**Component:** Mostly database-driven
**Sections:**

| Section | Type | Current Source | CMS Priority |
|---------|------|----------------|--------------|
| Hero | Banner | Hardcoded inline | 🔴 High |
| Price List Table | Data Table | Database (service_prices) | ✅ Done |
| Financing Options | Cards | Database (financing_options) | ✅ Done |
| Insurance Providers | Logo Grid | Database (insurance_providers) | ✅ Done |
| CTA Section | Call-to-action | Hardcoded inline | 🔴 High |

**Translation File Usage:**
- Only labels: `payments.metaTitle`, `payments.metaDescription`
- Section headers are hardcoded in Portuguese/English inline

**Database Tables Used:**
- `service_prices` + `service_price_translations`
- `financing_options` + `financing_option_translations`
- `insurance_providers` + `insurance_provider_translations`

**Opportunities:**
- Use hero_sections table instead of inline hero
- Use cta_sections table for bottom CTA

---

### 5. Contact Page (`/[locale]/contacto/page.tsx`)

**Route:** `/contacto` (pt), `/en/contact` (en)
**Component:** Hardcoded with form
**Sections:**

| Section | Type | Current Source | CMS Priority |
|---------|------|----------------|--------------|
| Hero | Banner | Hardcoded inline | 🔴 High |
| Contact Info | Info Cards | Hardcoded | 🔴 High |
| Google Map | Embedded Map | Hardcoded | 🟡 Medium |
| Contact Form | Form | Component | ✅ Done |
| Regulatory Info | Text Block | Hardcoded | 🟡 Medium |

**Hardcoded Data:**
- Address: Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa
- Phone: 935 189 807
- Email: geral@clinicaferreiraborges.pt
- Hours: Mon-Fri 9h-19h, Sat 9h-13h
- Map embed URL with Google Places API key

**Translation File Usage:**
- Only minimal labels from `location.*` namespace

**Opportunities:**
- Create "contact_information" table for all contact details
- Create "office_locations" table for multi-location support
- Move regulatory info to settings or dedicated table

---

### 6. Treatment Detail Page (`/[locale]/tratamentos/[slug]/page.tsx`)

**Route:** `/tratamentos/{slug}` (pt), `/en/treatments/{slug}` (en)
**Component:** Highly database-driven with translation fallbacks
**Sections:**

| Section | Type | Current Source | CMS Priority |
|---------|------|----------------|--------------|
| Hero with Stats | Banner + Cards | Database + Translation | ✅ Mostly Done |
| Benefits (6 cards) | Feature Grid | Translation Fallback | 🟡 Medium |
| Intro SEO Content | Rich Text | Translation Fallback | ✅ Done |
| Social Proof Stats | Stats Bar | Translation | 🟢 Low |
| Technology Section | Image + Text | Translation Fallback | 🟡 Medium |
| Team Section | Image + Text | Translation Fallback | 🟡 Medium |
| Why Choose Us (4 cards) | Feature Grid | Translation Fallback | 🟡 Medium |
| Process Steps (4 steps) | Timeline | Translation Fallback | 🟡 Medium |
| SEO Content Grid (6 boxes) | Info Grid | Translation | 🟡 Medium |
| Pricing | Pricing Card | Hardcoded Structure | 🟡 Medium |
| FAQs | Accordion | Database (treatment_faqs) | ✅ Done |
| Urgency Section | CTA Banner | Translation Fallback | 🔴 High |
| Final CTA | Contact Form | Translation Fallback | 🔴 High |
| SEO Footer | Rich Text | Translation Fallback | ✅ Done |

**Database Schema Used:**
```typescript
treatments {
  slug, icon_url, image_url, display_order, is_featured, is_published
  sections: JSONB {
    benefits, intro, socialProof, technology, team,
    whyChooseUs, processSteps, seoContentGrid,
    pricing, faqs, urgency, finalCta, seoFooter
  }
}

treatment_translations {
  title, description, meta_description
  section_content: JSONB {
    benefits: { label, title, subtitle },
    intro: { title, description },
    // ... all section content
  }
}

treatment_faqs {
  display_order
}

treatment_faq_translations {
  question, answer
}
```

**Translation File Fallbacks:**
- Extensive fallback system using `treatment.*` namespace
- 200+ translation keys for generic content

**Opportunities:**
- Treatment system is well-implemented
- Could add more section configuration options
- Template system for different treatment types

---

### 7. Terms & Conditions Page (`/[locale]/termos-condicoes/page.tsx`)

**Route:** `/termos-condicoes` (pt), `/en/terms-conditions` (en)
**Component:** Fully hardcoded
**Sections:**

| Section | Type | Current Source | CMS Priority |
|---------|------|----------------|--------------|
| Hero | Banner | Hardcoded inline | 🔴 High |
| Legal Sections (13) | Rich Text | Hardcoded array | 🟡 Medium |
| Regulatory Info | Text Block | Hardcoded | 🟡 Medium |

**Content Structure:**
```typescript
const content = locale === 'pt' ? {
  title: 'Termos e Condições',
  lastUpdated: 'Última atualização: Janeiro 2025',
  intro: '...',
  sections: [
    { title: '...', content: '...' },
    // 13 sections total
  ]
} : { /* English version */ }
```

**Opportunities:**
- Create "legal_pages" table with rich text sections
- Create "legal_sections" for reusable legal content blocks
- Version tracking for legal content updates

---

### 8. Admin Page (`/[locale]/admin/page.tsx`)

**Route:** `/admin` (pt), `/en/admin` (en)
**Purpose:** Content management interface
**Status:** Not analyzed in detail (management interface)

---

## Content Distribution Analysis

### Content by Source

```
Database (60%):
├── Treatments (full CRUD) ✅
├── Team Members (full CRUD) ✅
├── Service Prices (full CRUD) ✅
├── Financing Options (full CRUD) ✅
├── Insurance Providers (full CRUD) ✅
└── Hero Sections (partial) 🟡

Translation Files (30%):
├── Navigation labels
├── Home page sections
├── Common UI elements
├── Treatment page fallbacks
├── Form labels
└── Button text

Hardcoded (10%):
├── Contact information (5+ locations)
├── Booking URLs (10+ locations)
├── Social media links
├── Regulatory information
├── Terms & conditions content
└── Component-level configuration
```

### Content by Type

| Content Type | Count | Current Source | Recommended |
|--------------|-------|----------------|-------------|
| **Pages** | 8 | Mixed | Database |
| **Hero Sections** | 8+ | Hardcoded/Translation | Database |
| **Feature Grids** | 10+ | Translation | Database |
| **CTAs** | 15+ | Hardcoded | Database |
| **FAQs** | 6 general + treatment-specific | Translation/Database | Database |
| **Contact Info** | 1 set, 10+ uses | Hardcoded | Database |
| **Treatments** | 15 | Database | ✅ Done |
| **Team Members** | 3+ | Database | ✅ Done |
| **Pricing** | 15+ items | Database | ✅ Done |
| **Legal Content** | 2 pages | Hardcoded | Database |
| **Technology Items** | 6 | Translation | Database |
| **Certification Badges** | 6 | Translation | Database |

---

## Recommended Database Schema

### 1. Generic Pages System

#### Core Pages Tables

```sql
-- Main pages table
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'home', 'info', 'legal', 'custom'
  layout_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'full-width', 'sidebar'
  is_published BOOLEAN DEFAULT false,
  publish_at TIMESTAMPTZ,
  unpublish_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  parent_page_id UUID REFERENCES cms_pages(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page translations
CREATE TABLE cms_page_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug_localized VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, language_code)
);

-- Indexes
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_published ON cms_pages(is_published, display_order);
CREATE INDEX idx_cms_pages_template ON cms_pages(template_type);
CREATE INDEX idx_cms_page_translations_language ON cms_page_translations(language_code);

-- RLS Policies
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMS pages viewable by everyone" ON cms_pages
  FOR SELECT USING (
    is_published = true
    AND (publish_at IS NULL OR publish_at <= NOW())
    AND (unpublish_at IS NULL OR unpublish_at > NOW())
  );

CREATE POLICY "CMS pages editable by authenticated users" ON cms_pages
  FOR ALL USING (auth.role() = 'authenticated');
```

#### Page Sections System

```sql
-- Section types: hero, features, cta, text, image, gallery, faq, testimonials, etc.
CREATE TABLE cms_page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'features', 'cta', 'text', 'faq', etc.
  component_name VARCHAR(100), -- React component to render
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,

  -- Styling options
  background_color VARCHAR(50),
  background_image_url TEXT,
  background_gradient TEXT,
  padding_top VARCHAR(20) DEFAULT 'normal',
  padding_bottom VARCHAR(20) DEFAULT 'normal',

  -- Layout options
  container_width VARCHAR(20) DEFAULT 'container', -- 'container', 'full-width', 'narrow'
  alignment VARCHAR(20) DEFAULT 'left', -- 'left', 'center', 'right'

  -- Section-specific settings (JSONB for flexibility)
  settings JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section translations
CREATE TABLE cms_page_section_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES cms_page_sections(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,

  -- Common fields
  heading TEXT,
  subheading TEXT,
  content TEXT, -- Rich text / HTML

  -- CTA fields
  primary_button_text VARCHAR(100),
  primary_button_url TEXT,
  secondary_button_text VARCHAR(100),
  secondary_button_url TEXT,

  -- Additional content (JSONB for flexibility)
  data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, language_code)
);

-- Indexes
CREATE INDEX idx_sections_page ON cms_page_sections(page_id, display_order);
CREATE INDEX idx_sections_type ON cms_page_sections(section_type);
CREATE INDEX idx_section_translations_language ON cms_page_section_translations(language_code);

-- RLS
ALTER TABLE cms_page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page sections viewable by everyone" ON cms_page_sections
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Page sections editable by authenticated users" ON cms_page_sections
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Feature/Benefit Sections

```sql
-- For reusable feature cards (benefits, why choose us, etc.)
CREATE TABLE cms_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon_type VARCHAR(50), -- 'lucide', 'image', 'emoji'
  icon_name VARCHAR(100), -- For Lucide: 'Shield', 'Heart', etc.
  icon_url TEXT, -- For custom images
  display_order INTEGER DEFAULT 0,
  category VARCHAR(50), -- Group features: 'benefits', 'services', 'values'
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cms_feature_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id UUID REFERENCES cms_features(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stat_value VARCHAR(50), -- e.g., "20+", "5000+", "98%"
  stat_label VARCHAR(100), -- e.g., "Years", "Patients", "Success Rate"
  UNIQUE(feature_id, language_code)
);

-- Junction table for features on pages/sections
CREATE TABLE cms_section_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES cms_page_sections(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES cms_features(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(section_id, feature_id)
);

CREATE INDEX idx_features_category ON cms_features(category, display_order);
CREATE INDEX idx_section_features_section ON cms_section_features(section_id);
```

### 3. Contact Information

```sql
-- Business contact information
CREATE TABLE contact_information (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_type VARCHAR(50) DEFAULT 'primary', -- 'primary', 'secondary', 'billing'
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  email VARCHAR(255),
  email_secondary VARCHAR(255),
  whatsapp VARCHAR(50),

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Portugal',

  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id VARCHAR(255),
  google_maps_embed_url TEXT,

  -- Display options
  is_primary BOOLEAN DEFAULT true,
  show_on_footer BOOLEAN DEFAULT true,
  show_on_contact_page BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contact_information_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  location_name VARCHAR(255),
  business_hours TEXT,
  special_hours TEXT, -- Holiday hours, etc.
  directions TEXT,
  additional_notes TEXT,
  UNIQUE(contact_info_id, language_code)
);

-- Business hours (for complex schedules)
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  UNIQUE(contact_info_id, day_of_week)
);

-- Special hours/exceptions (holidays, etc.)
CREATE TABLE business_hours_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  open_time TIME,
  close_time TIME,
  reason VARCHAR(255),
  UNIQUE(contact_info_id, exception_date)
);

CREATE INDEX idx_contact_info_primary ON contact_information(is_primary);
CREATE INDEX idx_business_hours_contact ON business_hours(contact_info_id);
```

### 4. FAQ System

```sql
-- General FAQs (not treatment-specific)
CREATE TABLE cms_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100), -- 'general', 'appointments', 'payments', 'insurance'
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cms_faq_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID REFERENCES cms_faqs(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL, -- Can be HTML/Markdown
  UNIQUE(faq_id, language_code)
);

-- Junction table for FAQs on pages
CREATE TABLE cms_page_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  faq_id UUID REFERENCES cms_faqs(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(page_id, faq_id)
);

CREATE INDEX idx_faqs_category ON cms_faqs(category, display_order);
```

### 5. Social Media Links

```sql
CREATE TABLE social_media_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube'
  url TEXT NOT NULL,
  icon_name VARCHAR(50), -- Lucide icon name or custom
  icon_url TEXT, -- Custom icon URL
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  show_in_header BOOLEAN DEFAULT false,
  show_in_footer BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_media_link_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_link_id UUID REFERENCES social_media_links(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  display_name VARCHAR(100),
  hover_text VARCHAR(255),
  UNIQUE(social_link_id, language_code)
);

CREATE INDEX idx_social_links_order ON social_media_links(display_order);
```

### 6. Navigation Menus

```sql
-- For fully customizable navigation
CREATE TABLE navigation_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_location VARCHAR(50) NOT NULL, -- 'header', 'footer', 'mobile', 'sidebar'
  slug VARCHAR(255) UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE navigation_menu_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES navigation_menus(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  name VARCHAR(100) NOT NULL,
  UNIQUE(menu_id, language_code)
);

CREATE TABLE navigation_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES navigation_menus(id) ON DELETE CASCADE,
  parent_item_id UUID REFERENCES navigation_menu_items(id) ON DELETE CASCADE,

  -- Link details
  link_type VARCHAR(50) DEFAULT 'internal', -- 'internal', 'external', 'treatment', 'page'
  url TEXT, -- For external links
  page_id UUID REFERENCES cms_pages(id), -- For internal pages
  treatment_id UUID REFERENCES treatments(id), -- For treatment links

  -- Display
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  open_in_new_tab BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,

  -- Mega menu support
  is_mega_menu BOOLEAN DEFAULT false,
  mega_menu_columns INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE navigation_menu_item_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES navigation_menu_items(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  UNIQUE(menu_item_id, language_code)
);

CREATE INDEX idx_nav_items_menu ON navigation_menu_items(menu_id, display_order);
CREATE INDEX idx_nav_items_parent ON navigation_menu_items(parent_item_id);
```

### 7. Legal Pages & Content Versions

```sql
-- For legal documents with version tracking
CREATE TABLE legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  page_type VARCHAR(50), -- 'terms', 'privacy', 'cookies', 'gdpr'
  version VARCHAR(20) NOT NULL,
  is_current BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_page_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_page_id UUID REFERENCES legal_pages(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  introduction TEXT,
  content TEXT, -- Full HTML/Markdown content
  last_updated_text VARCHAR(100), -- e.g., "Last updated: January 2025"
  UNIQUE(legal_page_id, language_code)
);

-- Legal sections (reusable blocks)
CREATE TABLE legal_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_page_id UUID REFERENCES legal_pages(id) ON DELETE CASCADE,
  section_type VARCHAR(50), -- 'terms', 'liability', 'privacy', 'cookies'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_section_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES legal_sections(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  heading VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  UNIQUE(section_id, language_code)
);

CREATE INDEX idx_legal_pages_current ON legal_pages(is_current, page_type);
CREATE INDEX idx_legal_sections_page ON legal_sections(legal_page_id, display_order);
```

### 8. Technology/Equipment Showcase

```sql
CREATE TABLE technology_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50), -- 'imaging', 'sterilization', 'treatment', 'diagnostic'
  icon_name VARCHAR(50),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE technology_item_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technology_id UUID REFERENCES technology_items(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  benefits JSONB, -- Array of benefit strings
  specifications JSONB, -- Technical specs
  UNIQUE(technology_id, language_code)
);

CREATE INDEX idx_technology_category ON technology_items(category, display_order);
```

### 9. Certification Badges

```sql
CREATE TABLE certification_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  badge_type VARCHAR(50), -- 'certification', 'award', 'stat', 'achievement'
  icon_name VARCHAR(50),
  icon_url TEXT,
  image_url TEXT,
  stat_value VARCHAR(50), -- e.g., "20+", "5000+", "4.9"
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certification_badge_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id UUID REFERENCES certification_badges(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stat_label VARCHAR(100), -- e.g., "Years of Experience", "Patients Treated"
  UNIQUE(badge_id, language_code)
);

CREATE INDEX idx_badges_order ON certification_badges(display_order);
```

### 10. Settings & Configuration

```sql
-- Enhanced settings table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_category VARCHAR(50), -- 'general', 'booking', 'seo', 'integrations'
  value_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'url'
  value TEXT, -- Stored as text, parsed based on value_type
  is_translatable BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Can be exposed to frontend
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_setting_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_id UUID REFERENCES system_settings(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  value TEXT,
  UNIQUE(setting_id, language_code)
);

-- Seed important settings
INSERT INTO system_settings (setting_key, setting_category, value_type, value, is_public) VALUES
  ('booking_url', 'booking', 'url', 'https://booking.clinicaferreiraborges.pt', true),
  ('phone_primary', 'contact', 'string', '+351935189807', true),
  ('email_primary', 'contact', 'string', 'geral@clinicaferreiraborges.pt', true),
  ('google_place_id', 'integrations', 'string', 'ChIJ...', false),
  ('google_analytics_id', 'integrations', 'string', 'G-...', false),
  ('clinic_name', 'general', 'string', 'Clínica Ferreira Borges', true, true);

CREATE INDEX idx_settings_category ON system_settings(setting_category);
CREATE INDEX idx_settings_public ON system_settings(is_public);
```

---

## Generic CMS Page System Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CMS Pages Layer                       │
├─────────────────────────────────────────────────────────┤
│  Page Definition (slug, template, layout)               │
│  └─ Page Sections (ordered, configurable)               │
│     ├─ Hero Section                                     │
│     ├─ Feature Grid Section                             │
│     ├─ Text Content Section                             │
│     ├─ CTA Section                                       │
│     ├─ FAQ Section                                       │
│     └─ Custom Sections                                   │
└─────────────────────────────────────────────────────────┘
```

### Page Templates

```typescript
// Define available page templates
enum PageTemplate {
  HOME = 'home',           // Hero + multiple sections
  INFO = 'info',           // Standard info page (team, technology)
  LEGAL = 'legal',         // Legal documents
  CONTACT = 'contact',     // Contact form + info
  TREATMENT = 'treatment', // Treatment detail (already exists)
  CUSTOM = 'custom'        // Fully customizable
}

// Template configurations
const templateConfig = {
  home: {
    defaultSections: ['hero', 'certifications', 'services', 'safety', 'team-credentials', 'reviews', 'faq'],
    allowCustomSections: true
  },
  info: {
    defaultSections: ['hero', 'content', 'cta'],
    allowCustomSections: true
  },
  legal: {
    defaultSections: ['hero', 'legal-content', 'regulatory-info'],
    allowCustomSections: false
  },
  contact: {
    defaultSections: ['hero', 'contact-info', 'contact-form', 'map', 'regulatory-info'],
    allowCustomSections: false
  }
}
```

### Section Types

```typescript
enum SectionType {
  // Layout Sections
  HERO = 'hero',
  CTA = 'cta',

  // Content Sections
  TEXT = 'text',                    // Rich text content
  TWO_COLUMN = 'two-column',        // Text + Image
  CARDS_GRID = 'cards-grid',        // Generic card grid

  // Feature Sections
  FEATURES = 'features',             // Feature grid with icons
  BENEFITS = 'benefits',             // Benefits showcase
  PROCESS_STEPS = 'process-steps',  // Step-by-step process
  STATS = 'stats',                   // Statistics/numbers

  // Data Sections
  FAQ = 'faq',                       // FAQ accordion
  TESTIMONIALS = 'testimonials',     // Reviews/testimonials
  TEAM_GRID = 'team-grid',          // Team members
  TREATMENT_GRID = 'treatment-grid', // Treatments/services
  GALLERY = 'gallery',               // Image gallery

  // Interactive Sections
  CONTACT_FORM = 'contact-form',     // Contact form
  BOOKING_CTA = 'booking-cta',       // Booking call-to-action

  // Specific Sections
  PRICING_TABLE = 'pricing-table',   // Pricing information
  CERTIFICATION_BADGES = 'certification-badges',
  GOOGLE_REVIEWS = 'google-reviews',
  MAP = 'map',                       // Google Maps embed

  // Custom
  CUSTOM_HTML = 'custom-html'        // For advanced users
}
```

### Section Component Mapping

```typescript
// Map section types to React components
const sectionComponents = {
  hero: HeroSection,
  cta: CTASection,
  text: TextSection,
  'two-column': TwoColumnSection,
  features: FeaturesSection,
  benefits: BenefitsSection,
  'process-steps': ProcessStepsSection,
  stats: StatsSection,
  faq: FAQSection,
  testimonials: TestimonialsSection,
  'team-grid': TeamGridSection,
  'treatment-grid': TreatmentGridSection,
  gallery: GallerySection,
  'contact-form': ContactFormSection,
  'booking-cta': BookingCTASection,
  'pricing-table': PricingTableSection,
  'certification-badges': CertificationBadgesSection,
  'google-reviews': GoogleReviewsSection,
  map: MapSection,
  'custom-html': CustomHTMLSection
};
```

### Page Rendering System

```typescript
// src/app/[locale]/[...slug]/page.tsx
export default async function CMSPage({
  params
}: {
  params: Promise<{ locale: string; slug: string[] }>
}) {
  const { locale, slug } = await params;
  const pageSlug = slug.join('/');

  // Fetch page data
  const page = await getPageBySlug(pageSlug, locale);

  if (!page) {
    notFound();
  }

  // Get sections for this page
  const sections = await getPageSections(page.id, locale);

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        const SectionComponent = sectionComponents[section.section_type];

        if (!SectionComponent) {
          console.warn(`Unknown section type: ${section.section_type}`);
          return null;
        }

        return (
          <SectionComponent
            key={section.id}
            data={section}
            locale={locale}
          />
        );
      })}
    </div>
  );
}
```

### Section Configuration Schema

```typescript
// Example: Hero Section Configuration
interface HeroSectionConfig {
  // Visual
  backgroundImage?: string;
  backgroundGradient?: string;
  backgroundColor?: string;
  overlayOpacity?: number;
  height?: 'small' | 'medium' | 'large' | 'full-screen';

  // Content
  heading: string;
  subheading?: string;
  showBadge?: boolean;
  badgeText?: string;

  // CTAs
  primaryCTA?: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  secondaryCTA?: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  };

  // Layout
  contentAlignment?: 'left' | 'center' | 'right';
  showStats?: boolean;
  stats?: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
}

// Example: Features Section Configuration
interface FeaturesSectionConfig {
  // Layout
  columns: 2 | 3 | 4;
  cardStyle: 'bordered' | 'shadow' | 'minimal';

  // Content
  heading?: string;
  subheading?: string;

  // Features (from cms_features table)
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;

  // Behavior
  enableHover?: boolean;
  linkable?: boolean;
}
```

### Admin Interface Structure

```typescript
// Collection configuration for admin panel
const pageCollectionConfig: CollectionConfig = {
  id: 'cms-pages',
  name: 'Pages',
  nameSingular: 'Page',
  icon: FileText,
  description: 'Manage website pages and their content',

  fields: [
    {
      name: 'slug',
      label: 'URL Slug',
      type: 'text',
      required: true,
      help: 'URL-friendly identifier (e.g., "about-us")'
    },
    {
      name: 'template_type',
      label: 'Page Template',
      type: 'select',
      required: true,
      options: [
        { value: 'home', label: 'Home Page' },
        { value: 'info', label: 'Information Page' },
        { value: 'legal', label: 'Legal Page' },
        { value: 'contact', label: 'Contact Page' },
        { value: 'custom', label: 'Custom' }
      ]
    },
    {
      name: 'layout_type',
      label: 'Layout',
      type: 'select',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'full-width', label: 'Full Width' },
        { value: 'sidebar', label: 'With Sidebar' }
      ]
    },
    {
      name: 'is_published',
      label: 'Published',
      type: 'boolean'
    },
    {
      name: 'publish_at',
      label: 'Publish Date',
      type: 'datetime'
    }
  ],

  translatableFields: {
    fields: [
      {
        name: 'title',
        label: 'Page Title',
        type: 'text',
        required: true
      },
      {
        name: 'slug_localized',
        label: 'Localized Slug',
        type: 'text',
        help: 'Leave empty to use default slug'
      },
      {
        name: 'meta_title',
        label: 'SEO Title',
        type: 'text',
        maxLength: 60
      },
      {
        name: 'meta_description',
        label: 'SEO Description',
        type: 'textarea',
        maxLength: 160
      },
      {
        name: 'meta_keywords',
        label: 'SEO Keywords',
        type: 'text'
      }
    ]
  },

  // Nested sections editor
  nestedCollections: [
    {
      id: 'sections',
      name: 'Page Sections',
      table: 'cms_page_sections',
      sortable: true,
      addButtonText: 'Add Section'
    }
  ]
};
```

### Section Builder UI

```typescript
// Admin panel section builder
const SectionBuilder = ({ pageId, locale }) => {
  const [sections, setSections] = useState([]);

  const addSection = (sectionType: SectionType) => {
    const newSection = {
      section_type: sectionType,
      display_order: sections.length,
      is_enabled: true,
      settings: getDefaultSettings(sectionType)
    };

    setSections([...sections, newSection]);
  };

  const reorderSections = (result) => {
    // Drag-and-drop reorder logic
  };

  return (
    <div className="section-builder">
      <div className="section-list">
        <DragDropContext onDragEnd={reorderSections}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <SectionCard
                          section={section}
                          onEdit={() => editSection(section)}
                          onDelete={() => deleteSection(section.id)}
                          onToggle={() => toggleSection(section.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="add-section-panel">
        <h3>Add Section</h3>
        <div className="section-types-grid">
          {Object.values(SectionType).map((type) => (
            <button
              key={type}
              onClick={() => addSection(type)}
              className="section-type-button"
            >
              <Icon name={getSectionIcon(type)} />
              <span>{getSectionLabel(type)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Pre-built Section Templates

```typescript
// Provide pre-built templates for common page layouts
const sectionTemplates = {
  'landing-page': [
    { type: 'hero', preset: 'with-stats' },
    { type: 'features', preset: '3-column' },
    { type: 'cta', preset: 'centered' },
    { type: 'testimonials', preset: 'carousel' },
    { type: 'faq', preset: 'accordion' },
    { type: 'booking-cta', preset: 'split' }
  ],

  'service-page': [
    { type: 'hero', preset: 'image-right' },
    { type: 'text', preset: 'introduction' },
    { type: 'benefits', preset: '4-column' },
    { type: 'process-steps', preset: '4-steps' },
    { type: 'pricing-table', preset: 'simple' },
    { type: 'faq', preset: 'accordion' },
    { type: 'cta', preset: 'booking' }
  ],

  'about-page': [
    { type: 'hero', preset: 'minimal' },
    { type: 'two-column', preset: 'image-left' },
    { type: 'team-grid', preset: '3-column' },
    { type: 'stats', preset: '4-stats' },
    { type: 'certification-badges', preset: 'grid' },
    { type: 'cta', preset: 'contact' }
  ]
};
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1-2)

#### Week 1: Core Infrastructure

**Goals:**
- Set up generic CMS page system
- Migrate contact information
- Create reusable section components

**Tasks:**

1. **Database Setup** (2 days)
   ```sql
   -- Run migrations
   - 20251008000000_create_cms_pages.sql
   - 20251008000100_create_cms_sections.sql
   - 20251008000200_create_contact_information.sql
   - 20251008000300_create_social_media_links.sql
   - 20251008000400_create_system_settings.sql
   ```

2. **Seed Critical Data** (1 day)
   ```sql
   -- Migrate existing hardcoded data
   INSERT INTO contact_information (...)
   INSERT INTO social_media_links (...)
   INSERT INTO system_settings (...)
   ```

3. **Create Data Access Layer** (2 days)
   ```typescript
   // src/lib/supabase/queries/cms.ts
   export async function getPageBySlug(slug: string, locale: string)
   export async function getPageSections(pageId: string, locale: string)
   export async function getContactInformation(locale: string)
   export async function getSocialMediaLinks()
   export async function getSystemSetting(key: string, locale?: string)
   ```

#### Week 2: Component Migration

**Goals:**
- Create reusable section components
- Migrate Header, Footer, Contact page

**Tasks:**

1. **Base Section Components** (3 days)
   ```typescript
   // src/components/cms/sections/
   - HeroSection.tsx
   - CTASection.tsx
   - TextSection.tsx
   - FeatureGridSection.tsx
   - FAQSection.tsx
   ```

2. **Update Layout Components** (2 days)
   ```typescript
   // Update Header.tsx
   - Use getContactInformation() for phone
   - Use getSocialMediaLinks() if needed

   // Update Footer.tsx
   - Use getContactInformation() for all contact data
   - Use getSocialMediaLinks() for social icons
   - Remove hardcoded values
   ```

3. **Migrate Contact Page** (2 days)
   ```typescript
   // Update contacto/page.tsx
   - Fetch contact info from database
   - Replace hardcoded data
   - Use generic sections if applicable
   ```

### Phase 2: Content Migration (Week 3-4)

#### Week 3: Hero & CTA Sections

**Goals:**
- Implement hero_sections usage across all pages
- Implement cta_sections as reusable components
- Update all existing pages

**Tasks:**

1. **Hero Section System** (2 days)
   ```typescript
   // Complete hero_sections implementation
   - Create HeroSection component that reads from DB
   - Migrate all page heroes to database
   - Update: Home, Team, Technology, Payments, Contact
   ```

2. **CTA Section System** (2 days)
   ```typescript
   // Complete cta_sections implementation
   - Create reusable CTASection component
   - Seed CTA data for all pages
   - Replace hardcoded CTAs everywhere
   ```

3. **Testing & Validation** (1 day)
   - Verify all pages render correctly
   - Check multilingual support
   - Validate admin panel functionality

#### Week 4: Feature Sections & FAQs

**Goals:**
- Migrate all feature grids to database
- Implement general FAQ system
- Update Home page completely

**Tasks:**

1. **Features System** (3 days)
   ```sql
   -- Create and seed
   - cms_features table
   - cms_feature_translations table
   - cms_section_features junction table
   ```

   ```typescript
   // Migrate content
   - Safety Section → cms_features (category: 'safety')
   - Team Credentials → cms_features (category: 'credentials')
   - Benefits → cms_features (category: 'benefits')
   - Technology items → technology_items table
   ```

2. **FAQ System** (2 days)
   ```sql
   -- General FAQs
   - cms_faqs table
   - cms_faq_translations table
   ```

   ```typescript
   // Migrate home page FAQs
   - 6 FAQs from translation file to database
   ```

### Phase 3: Advanced Features (Week 5-6)

#### Week 5: Legal Pages & Technology

**Goals:**
- Migrate Terms & Conditions to database
- Create technology showcase system
- Implement certification badges

**Tasks:**

1. **Legal Pages System** (3 days)
   ```sql
   - legal_pages table
   - legal_sections table
   - Version tracking
   ```

   ```typescript
   // Migrate termos-condicoes/page.tsx
   - Move all 13 sections to database
   - Add version tracking
   - Create legal page template
   ```

2. **Technology & Certifications** (2 days)
   ```sql
   - technology_items table
   - certification_badges table
   ```

   ```typescript
   // Migrate from translation files
   - 6 technology items
   - 6 certification badges
   ```

#### Week 6: Navigation & Polish

**Goals:**
- Optional: Implement navigation menu system
- Create page templates
- Admin interface polish

**Tasks:**

1. **Navigation System** (3 days) [OPTIONAL]
   ```sql
   - navigation_menus table
   - navigation_menu_items table
   ```

2. **Page Templates** (2 days)
   ```typescript
   // Create templates
   - Landing page template
   - Service page template
   - About page template
   ```

3. **Admin Panel Enhancements** (1 day)
   - Add section builder UI
   - Add page preview
   - Improve UX

### Phase 4: Testing & Launch (Week 7)

**Goals:**
- Comprehensive testing
- Performance optimization
- Documentation
- Launch

**Tasks:**

1. **Testing** (3 days)
   - Unit tests for all queries
   - Integration tests for page rendering
   - E2E tests for critical flows
   - Multilingual testing (PT/EN)

2. **Performance** (1 day)
   - Query optimization
   - Caching strategy
   - Image optimization

3. **Documentation** (1 day)
   - Admin user guide
   - Developer documentation
   - Content guidelines

4. **Launch** (2 days)
   - Deploy database migrations
   - Migrate production data
   - Monitor and fix issues

---

## Implementation Roadmap

### Timeline Overview

```
Week 1-2: Foundation
├─ Database schema setup
├─ Contact info migration
└─ Base components

Week 3-4: Content Migration
├─ Hero sections
├─ CTA sections
├─ Feature grids
└─ FAQs

Week 5-6: Advanced Features
├─ Legal pages
├─ Technology showcase
├─ Certifications
└─ Navigation (optional)

Week 7: Testing & Launch
├─ Comprehensive testing
├─ Performance optimization
└─ Production deployment
```

### Success Metrics

**By End of Phase 1:**
- ✅ Contact information centralized
- ✅ Header/Footer using database
- ✅ 0 hardcoded contact references

**By End of Phase 2:**
- ✅ All pages use hero_sections table
- ✅ All pages use cta_sections table
- ✅ Home page 80% CMS-driven

**By End of Phase 3:**
- ✅ 95%+ content in database
- ✅ Legal pages versioned
- ✅ All translation-file content moved

**By End of Phase 4:**
- ✅ Zero hardcoded content (except code-level config)
- ✅ Marketing team can create new pages
- ✅ Full multilingual support
- ✅ Admin panel complete

### Resource Requirements

**Development Team:**
- 1 Full-stack Developer (7 weeks)
- 1 QA Engineer (2 weeks, part-time)

**Estimated Hours:**
- Database & Backend: 80 hours
- Frontend Components: 60 hours
- Admin Panel: 40 hours
- Testing & QA: 30 hours
- Documentation: 10 hours
- **Total: 220 hours** (5.5 weeks at 40h/week)

### Risk Mitigation

**Risks & Mitigation:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data migration errors | High | Medium | Thorough testing, rollback plan, staging environment |
| Performance degradation | Medium | Low | Query optimization, caching, monitoring |
| Breaking existing features | High | Medium | Comprehensive tests, gradual rollout, feature flags |
| Admin UX complexity | Medium | Medium | User testing, iterative improvements, documentation |
| Translation file conflicts | Low | Low | Clear migration path, deprecation warnings |

**Rollback Strategy:**
- Keep translation files as fallback during transition
- Use feature flags for new CMS features
- Database migrations support rollback
- Staging environment for pre-production testing

### Post-Launch Plan

**Month 1-2:**
- Monitor performance and errors
- Gather user feedback from marketing team
- Make UX improvements
- Add requested features

**Month 3-6:**
- Analytics on CMS usage
- Create more page templates
- Advanced features (A/B testing, scheduling, etc.)
- User training and documentation updates

**Ongoing:**
- Regular content audits
- SEO optimization
- Performance monitoring
- Security updates

---

## Conclusion

### Current State Summary

The Clínica Ferreira Borges website has a **strong foundation** with ~60% of content already in the database. The treatment and team management systems are well-designed and fully functional. However, **30% of content remains in translation files** and **10% is hardcoded**, limiting the marketing team's autonomy.

### Proposed Solution

Implement a **flexible, section-based CMS architecture** that:

1. **Centralizes all content** in the database
2. **Enables page creation** without code changes
3. **Provides reusable components** for consistency
4. **Supports multilingual content** at every level
5. **Empowers marketing team** with full control

### Key Benefits

**For Marketing Team:**
- ✅ Create new pages without developer
- ✅ Update content in real-time
- ✅ A/B test different versions
- ✅ Schedule content publication
- ✅ Manage multilingual content easily

**For Development Team:**
- ✅ Reduce content change requests by 90%
- ✅ Single source of truth for all content
- ✅ Consistent admin interface
- ✅ Easier to maintain and extend
- ✅ Better separation of concerns

**For Business:**
- ✅ Faster time-to-market for campaigns
- ✅ Reduced development costs
- ✅ Better SEO control
- ✅ Improved content governance
- ✅ Scalable for future growth

### Investment & ROI

**Investment:**
- 7 weeks development time
- 220 developer hours
- Low risk with staged rollout

**ROI:**
- Marketing team saves 10+ hours/week
- Development team saves 5+ hours/week
- **Payback period: ~15 weeks**
- Long-term efficiency gains
- Improved content velocity

### Next Steps

1. **Review & Approve** this analysis with stakeholders
2. **Prioritize features** based on business needs
3. **Set up development environment** and staging
4. **Begin Phase 1** implementation
5. **Iterate and improve** based on feedback

---

**Document Version:** 1.0
**Created:** October 7, 2025
**Author:** Claude Code Analysis
**Status:** Proposal - Awaiting Review
