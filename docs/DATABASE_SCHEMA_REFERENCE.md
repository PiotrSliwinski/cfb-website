# Database Schema Quick Reference

**Project:** Clínica Ferreira Borges CMS
**Date:** October 7, 2025

---

## Table of Contents

1. [Existing Tables](#existing-tables)
2. [Proposed New Tables](#proposed-new-tables)
3. [Table Relationships](#table-relationships)
4. [Migration Scripts](#migration-scripts)

---

## Existing Tables

### Core System

#### languages
```sql
id              UUID PRIMARY KEY
code            VARCHAR(5) UNIQUE     -- 'pt', 'en'
name            VARCHAR(50)           -- 'Português', 'English'
is_default      BOOLEAN
created_at      TIMESTAMPTZ
```

### Content Management

#### treatments
```sql
id              UUID PRIMARY KEY
slug            VARCHAR(255) UNIQUE
icon_url        TEXT
image_url       TEXT
display_order   INTEGER
is_featured     BOOLEAN
is_popular      BOOLEAN
is_published    BOOLEAN
sections        JSONB                 -- Section configuration
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### treatment_translations
```sql
id              UUID PRIMARY KEY
treatment_id    UUID REFERENCES treatments
language_code   VARCHAR(5) REFERENCES languages
title           VARCHAR(255)
subtitle        TEXT
description     TEXT
meta_description TEXT
section_content JSONB                 -- Translatable section data
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
UNIQUE(treatment_id, language_code)
```

#### treatment_faqs
```sql
id              UUID PRIMARY KEY
treatment_id    UUID REFERENCES treatments
display_order   INTEGER
created_at      TIMESTAMPTZ
```

#### treatment_faq_translations
```sql
id              UUID PRIMARY KEY
faq_id          UUID REFERENCES treatment_faqs
language_code   VARCHAR(5) REFERENCES languages
question        TEXT
answer          TEXT
UNIQUE(faq_id, language_code)
```

### Team Management

#### team_members
```sql
id              UUID PRIMARY KEY
slug            VARCHAR(255) UNIQUE
photo_url       TEXT
display_order   INTEGER
email           VARCHAR(255)
phone           VARCHAR(50)
is_published    BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### team_member_translations
```sql
id              UUID PRIMARY KEY
member_id       UUID REFERENCES team_members
language_code   VARCHAR(5) REFERENCES languages
name            VARCHAR(255)
title           VARCHAR(255)
specialty       VARCHAR(255)
bio             TEXT
credentials     TEXT
UNIQUE(member_id, language_code)
```

#### team_member_specialties
```sql
id              UUID PRIMARY KEY
member_id       UUID REFERENCES team_members
treatment_id    UUID REFERENCES treatments
created_at      TIMESTAMPTZ
UNIQUE(member_id, treatment_id)
```

### Pricing & Payments

#### service_prices
```sql
id              UUID PRIMARY KEY
service_code    VARCHAR(100) UNIQUE
price_from      DECIMAL(10,2)
price_to        DECIMAL(10,2)
display_order   INTEGER
is_published    BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### service_price_translations
```sql
id              UUID PRIMARY KEY
service_price_id UUID REFERENCES service_prices
language_code   VARCHAR(5) REFERENCES languages
title           VARCHAR(255)
description     TEXT
UNIQUE(service_price_id, language_code)
```

#### financing_options
```sql
id              UUID PRIMARY KEY
provider_name   VARCHAR(255)
min_amount      DECIMAL(10,2)
max_amount      DECIMAL(10,2)
min_installments INTEGER
max_installments INTEGER
interest_rate   DECIMAL(5,2)
website_url     TEXT
display_order   INTEGER
is_published    BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### financing_option_translations
```sql
id              UUID PRIMARY KEY
financing_option_id UUID REFERENCES financing_options
language_code   VARCHAR(5) REFERENCES languages
title           VARCHAR(255)
description     TEXT
terms           TEXT
UNIQUE(financing_option_id, language_code)
```

#### insurance_providers
```sql
id              UUID PRIMARY KEY
provider_code   VARCHAR(100) UNIQUE
logo_url        TEXT
website_url     TEXT
phone           VARCHAR(50)
display_order   INTEGER
is_published    BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### insurance_provider_translations
```sql
id              UUID PRIMARY KEY
insurance_provider_id UUID REFERENCES insurance_providers
language_code   VARCHAR(5) REFERENCES languages
name            VARCHAR(255)
description     TEXT
coverage_details TEXT
UNIQUE(insurance_provider_id, language_code)
```

### Partial Implementations

#### hero_sections
```sql
id              UUID PRIMARY KEY
slug            VARCHAR(255) UNIQUE
page_identifier VARCHAR(255)
background_image_url TEXT
background_gradient TEXT
display_order   INTEGER
is_published    BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### hero_section_translations
```sql
id              UUID PRIMARY KEY
hero_section_id UUID REFERENCES hero_sections
language_code   VARCHAR(5)
heading         TEXT
subheading      TEXT
cta_text        VARCHAR(255)
cta_url         TEXT
secondary_cta_text VARCHAR(255)
secondary_cta_url TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
UNIQUE(hero_section_id, language_code)
```

#### cta_sections
```sql
id              UUID PRIMARY KEY
slug            VARCHAR(255) UNIQUE
section_identifier VARCHAR(255)
background_color VARCHAR(50)
background_image_url TEXT
display_order   INTEGER
is_published    BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### cta_section_translations
```sql
id              UUID PRIMARY KEY
cta_section_id  UUID REFERENCES cta_sections
language_code   VARCHAR(5)
heading         TEXT
subheading      TEXT
primary_button_text VARCHAR(255)
primary_button_url TEXT
secondary_button_text VARCHAR(255)
secondary_button_url TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
UNIQUE(cta_section_id, language_code)
```

### System

#### site_settings
```sql
id              UUID PRIMARY KEY
key             VARCHAR(255) UNIQUE
value           JSONB
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### site_setting_translations
```sql
id              UUID PRIMARY KEY
setting_id      UUID REFERENCES site_settings
language_code   VARCHAR(5) REFERENCES languages
value           JSONB
UNIQUE(setting_id, language_code)
```

#### contact_submissions
```sql
id              UUID PRIMARY KEY
name            VARCHAR(255)
email           VARCHAR(255)
phone           VARCHAR(50)
message         TEXT
treatment_interest VARCHAR(255)
language_code   VARCHAR(5)
status          VARCHAR(50)         -- 'new', 'contacted', 'converted', 'spam'
created_at      TIMESTAMPTZ
```

---

## Proposed New Tables

### 1. Generic CMS Pages

#### cms_pages
```sql
CREATE TABLE cms_pages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  template_type   VARCHAR(50) NOT NULL,     -- 'home', 'info', 'legal', 'custom'
  layout_type     VARCHAR(50) DEFAULT 'standard',
  parent_page_id  UUID REFERENCES cms_pages(id),
  display_order   INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT false,
  publish_at      TIMESTAMPTZ,
  unpublish_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_published ON cms_pages(is_published, display_order);
CREATE INDEX idx_cms_pages_template ON cms_pages(template_type);
```

#### cms_page_translations
```sql
CREATE TABLE cms_page_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id         UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  title           VARCHAR(255) NOT NULL,
  slug_localized  VARCHAR(255),
  meta_title      VARCHAR(255),
  meta_description TEXT,
  meta_keywords   TEXT,
  og_title        VARCHAR(255),
  og_description  TEXT,
  og_image_url    TEXT,
  canonical_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, language_code)
);

CREATE INDEX idx_cms_page_translations_language ON cms_page_translations(language_code);
```

### 2. Page Sections

#### cms_page_sections
```sql
CREATE TABLE cms_page_sections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id         UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  section_type    VARCHAR(50) NOT NULL,
  component_name  VARCHAR(100),
  display_order   INTEGER DEFAULT 0,
  is_enabled      BOOLEAN DEFAULT true,

  -- Styling
  background_color VARCHAR(50),
  background_image_url TEXT,
  background_gradient TEXT,
  padding_top     VARCHAR(20) DEFAULT 'normal',
  padding_bottom  VARCHAR(20) DEFAULT 'normal',

  -- Layout
  container_width VARCHAR(20) DEFAULT 'container',
  alignment       VARCHAR(20) DEFAULT 'left',

  -- Settings
  settings        JSONB,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_page ON cms_page_sections(page_id, display_order);
CREATE INDEX idx_sections_type ON cms_page_sections(section_type);
```

#### cms_page_section_translations
```sql
CREATE TABLE cms_page_section_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id      UUID REFERENCES cms_page_sections(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  heading         TEXT,
  subheading      TEXT,
  content         TEXT,
  primary_button_text VARCHAR(100),
  primary_button_url TEXT,
  secondary_button_text VARCHAR(100),
  secondary_button_url TEXT,
  data            JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, language_code)
);

CREATE INDEX idx_section_translations_language ON cms_page_section_translations(language_code);
```

### 3. Features & Benefits

#### cms_features
```sql
CREATE TABLE cms_features (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  icon_type       VARCHAR(50),          -- 'lucide', 'image', 'emoji'
  icon_name       VARCHAR(100),
  icon_url        TEXT,
  category        VARCHAR(50),          -- 'benefits', 'services', 'values', 'safety'
  display_order   INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_features_category ON cms_features(category, display_order);
```

#### cms_feature_translations
```sql
CREATE TABLE cms_feature_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id      UUID REFERENCES cms_features(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  stat_value      VARCHAR(50),
  stat_label      VARCHAR(100),
  UNIQUE(feature_id, language_code)
);
```

#### cms_section_features (Junction)
```sql
CREATE TABLE cms_section_features (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id      UUID REFERENCES cms_page_sections(id) ON DELETE CASCADE,
  feature_id      UUID REFERENCES cms_features(id) ON DELETE CASCADE,
  display_order   INTEGER DEFAULT 0,
  UNIQUE(section_id, feature_id)
);

CREATE INDEX idx_section_features_section ON cms_section_features(section_id);
```

### 4. Contact Information

#### contact_information
```sql
CREATE TABLE contact_information (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_type   VARCHAR(50) DEFAULT 'primary',
  phone           VARCHAR(50),
  phone_secondary VARCHAR(50),
  email           VARCHAR(255),
  email_secondary VARCHAR(255),
  whatsapp        VARCHAR(50),

  -- Address
  address_line1   VARCHAR(255),
  address_line2   VARCHAR(255),
  city            VARCHAR(100),
  state_province  VARCHAR(100),
  postal_code     VARCHAR(20),
  country         VARCHAR(100) DEFAULT 'Portugal',

  -- Geolocation
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  google_place_id VARCHAR(255),
  google_maps_embed_url TEXT,

  -- Display
  is_primary      BOOLEAN DEFAULT true,
  show_on_footer  BOOLEAN DEFAULT true,
  show_on_contact_page BOOLEAN DEFAULT true,
  display_order   INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_info_primary ON contact_information(is_primary);
```

#### contact_information_translations
```sql
CREATE TABLE contact_information_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  location_name   VARCHAR(255),
  business_hours  TEXT,
  special_hours   TEXT,
  directions      TEXT,
  additional_notes TEXT,
  UNIQUE(contact_info_id, language_code)
);
```

#### business_hours
```sql
CREATE TABLE business_hours (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL,     -- 0=Sunday, 1=Monday, ..., 6=Saturday
  open_time       TIME,
  close_time      TIME,
  is_closed       BOOLEAN DEFAULT false,
  UNIQUE(contact_info_id, day_of_week)
);
```

#### business_hours_exceptions
```sql
CREATE TABLE business_hours_exceptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  exception_date  DATE NOT NULL,
  is_closed       BOOLEAN DEFAULT false,
  open_time       TIME,
  close_time      TIME,
  reason          VARCHAR(255),
  UNIQUE(contact_info_id, exception_date)
);
```

### 5. General FAQs

#### cms_faqs
```sql
CREATE TABLE cms_faqs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  category        VARCHAR(100),         -- 'general', 'appointments', 'payments'
  display_order   INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faqs_category ON cms_faqs(category, display_order);
```

#### cms_faq_translations
```sql
CREATE TABLE cms_faq_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id          UUID REFERENCES cms_faqs(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  UNIQUE(faq_id, language_code)
);
```

#### cms_page_faqs (Junction)
```sql
CREATE TABLE cms_page_faqs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id         UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  faq_id          UUID REFERENCES cms_faqs(id) ON DELETE CASCADE,
  display_order   INTEGER DEFAULT 0,
  UNIQUE(page_id, faq_id)
);
```

### 6. Social Media

#### social_media_links
```sql
CREATE TABLE social_media_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform        VARCHAR(50) NOT NULL,
  url             TEXT NOT NULL,
  icon_name       VARCHAR(50),
  icon_url        TEXT,
  display_order   INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  show_in_header  BOOLEAN DEFAULT false,
  show_in_footer  BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_links_order ON social_media_links(display_order);
```

#### social_media_link_translations
```sql
CREATE TABLE social_media_link_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_link_id  UUID REFERENCES social_media_links(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  display_name    VARCHAR(100),
  hover_text      VARCHAR(255),
  UNIQUE(social_link_id, language_code)
);
```

### 7. Legal Pages

#### legal_pages
```sql
CREATE TABLE legal_pages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  page_type       VARCHAR(50),          -- 'terms', 'privacy', 'cookies'
  version         VARCHAR(20) NOT NULL,
  is_current      BOOLEAN DEFAULT true,
  effective_date  DATE NOT NULL,
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_pages_current ON legal_pages(is_current, page_type);
```

#### legal_page_translations
```sql
CREATE TABLE legal_page_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_page_id   UUID REFERENCES legal_pages(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  title           VARCHAR(255) NOT NULL,
  introduction    TEXT,
  content         TEXT,
  last_updated_text VARCHAR(100),
  UNIQUE(legal_page_id, language_code)
);
```

#### legal_sections
```sql
CREATE TABLE legal_sections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_page_id   UUID REFERENCES legal_pages(id) ON DELETE CASCADE,
  section_type    VARCHAR(50),
  display_order   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_sections_page ON legal_sections(legal_page_id, display_order);
```

#### legal_section_translations
```sql
CREATE TABLE legal_section_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id      UUID REFERENCES legal_sections(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  heading         VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  UNIQUE(section_id, language_code)
);
```

### 8. Technology Showcase

#### technology_items
```sql
CREATE TABLE technology_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  category        VARCHAR(50),          -- 'imaging', 'sterilization', 'treatment'
  icon_name       VARCHAR(50),
  image_url       TEXT,
  display_order   INTEGER DEFAULT 0,
  is_featured     BOOLEAN DEFAULT false,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_technology_category ON technology_items(category, display_order);
```

#### technology_item_translations
```sql
CREATE TABLE technology_item_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technology_id   UUID REFERENCES technology_items(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  benefits        JSONB,
  specifications  JSONB,
  UNIQUE(technology_id, language_code)
);
```

### 9. Certification Badges

#### certification_badges
```sql
CREATE TABLE certification_badges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  badge_type      VARCHAR(50),          -- 'certification', 'award', 'stat'
  icon_name       VARCHAR(50),
  icon_url        TEXT,
  image_url       TEXT,
  stat_value      VARCHAR(50),
  display_order   INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_order ON certification_badges(display_order);
```

#### certification_badge_translations
```sql
CREATE TABLE certification_badge_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id        UUID REFERENCES certification_badges(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  stat_label      VARCHAR(100),
  UNIQUE(badge_id, language_code)
);
```

### 10. Enhanced Settings

#### system_settings
```sql
CREATE TABLE system_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key     VARCHAR(255) UNIQUE NOT NULL,
  setting_category VARCHAR(50),        -- 'general', 'booking', 'seo'
  value_type      VARCHAR(20) DEFAULT 'string',
  value           TEXT,
  is_translatable BOOLEAN DEFAULT false,
  is_public       BOOLEAN DEFAULT false,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_category ON system_settings(setting_category);
CREATE INDEX idx_settings_public ON system_settings(is_public);
```

#### system_setting_translations
```sql
CREATE TABLE system_setting_translations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_id      UUID REFERENCES system_settings(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) REFERENCES languages(code),
  value           TEXT,
  UNIQUE(setting_id, language_code)
);
```

---

## Table Relationships

```
languages
  ↓ (1:N)
  ├─ treatment_translations
  ├─ team_member_translations
  ├─ cms_page_translations
  ├─ cms_feature_translations
  ├─ contact_information_translations
  └─ ... (all translation tables)

cms_pages
  ↓ (1:N)
  ├─ cms_page_sections
  │    ↓ (1:N)
  │    ├─ cms_page_section_translations
  │    └─ cms_section_features
  │         ↓ (N:1)
  │         └─ cms_features
  │              ↓ (1:N)
  │              └─ cms_feature_translations
  └─ cms_page_faqs
       ↓ (N:1)
       └─ cms_faqs
            ↓ (1:N)
            └─ cms_faq_translations

treatments
  ↓ (1:N)
  ├─ treatment_translations
  ├─ treatment_faqs
  │    ↓ (1:N)
  │    └─ treatment_faq_translations
  └─ team_member_specialties
       ↓ (N:1)
       └─ team_members
            ↓ (1:N)
            └─ team_member_translations

contact_information
  ↓ (1:N)
  ├─ contact_information_translations
  ├─ business_hours
  └─ business_hours_exceptions
```

---

## Migration Scripts

### Script Order

```sql
-- Phase 1: Foundation
20251008000000_create_cms_pages.sql
20251008000100_create_cms_sections.sql
20251008000200_create_cms_features.sql
20251008000300_create_contact_information.sql
20251008000400_create_social_media_links.sql
20251008000500_create_system_settings_enhanced.sql

-- Phase 2: Content
20251008000600_create_cms_faqs.sql
20251008000700_create_legal_pages.sql
20251008000800_create_technology_items.sql
20251008000900_create_certification_badges.sql

-- Phase 3: Data Migration
20251008001000_migrate_contact_data.sql
20251008001100_migrate_social_links.sql
20251008001200_migrate_hero_sections.sql
20251008001300_migrate_cta_sections.sql
20251008001400_migrate_home_features.sql
20251008001500_migrate_faqs.sql
20251008001600_migrate_legal_content.sql
```

### Example Migration: Contact Information

```sql
-- 20251008000300_create_contact_information.sql

-- Create table
CREATE TABLE contact_information (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_type VARCHAR(50) DEFAULT 'primary',
  phone VARCHAR(50),
  email VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id VARCHAR(255),
  google_maps_embed_url TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create translations
CREATE TABLE contact_information_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_info_id UUID REFERENCES contact_information(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  location_name VARCHAR(255),
  business_hours TEXT,
  UNIQUE(contact_info_id, language_code)
);

-- Enable RLS
ALTER TABLE contact_information ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact info viewable by everyone"
  ON contact_information FOR SELECT USING (true);

-- Seed data
INSERT INTO contact_information (
  phone, email, address_line1, address_line2,
  city, postal_code, is_primary
) VALUES (
  '+351935189807',
  'geral@clinicaferreiraborges.pt',
  'Rua Ferreira Borges 173C',
  'Campo de Ourique',
  'Lisboa',
  '1350-130',
  true
);

INSERT INTO contact_information_translations (
  contact_info_id, language_code, business_hours
) VALUES
  (
    (SELECT id FROM contact_information WHERE is_primary = true),
    'pt',
    'Segunda a Sábado: 10:00 - 20:00'
  ),
  (
    (SELECT id FROM contact_information WHERE is_primary = true),
    'en',
    'Monday to Saturday: 10:00 - 20:00'
  );
```

---

## Quick Reference Queries

### Get Page with Sections

```sql
SELECT
  p.id,
  p.slug,
  p.template_type,
  pt.title,
  pt.meta_description,
  json_agg(
    json_build_object(
      'id', s.id,
      'type', s.section_type,
      'order', s.display_order,
      'heading', st.heading,
      'content', st.content
    ) ORDER BY s.display_order
  ) as sections
FROM cms_pages p
LEFT JOIN cms_page_translations pt ON pt.page_id = p.id
LEFT JOIN cms_page_sections s ON s.page_id = p.id
LEFT JOIN cms_page_section_translations st ON st.section_id = s.id
WHERE p.slug = 'about-us'
  AND pt.language_code = 'en'
  AND s.is_enabled = true
GROUP BY p.id, pt.title, pt.meta_description;
```

### Get Contact Information

```sql
SELECT
  ci.*,
  cit.business_hours,
  cit.directions
FROM contact_information ci
LEFT JOIN contact_information_translations cit ON cit.contact_info_id = ci.id
WHERE ci.is_primary = true
  AND cit.language_code = 'pt';
```

### Get Features for Section

```sql
SELECT
  f.id,
  f.icon_name,
  ft.title,
  ft.description,
  ft.stat_value,
  ft.stat_label
FROM cms_section_features sf
JOIN cms_features f ON f.id = sf.feature_id
JOIN cms_feature_translations ft ON ft.feature_id = f.id
WHERE sf.section_id = '...'
  AND ft.language_code = 'en'
ORDER BY sf.display_order;
```

---

**Last Updated:** October 7, 2025
