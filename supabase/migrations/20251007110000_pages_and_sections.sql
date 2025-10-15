-- Pages and Sections System (Based on Strapi Architecture)
-- This migration implements Strapi's polymorphic component system for flexible page building

-- Drop existing pages table and related constraints
DROP TABLE IF EXISTS pages CASCADE;

-- ============================================================================
-- 1. MAIN PAGES TABLE
-- ============================================================================
-- Stores page metadata and scalar fields only
-- Components/sections are stored separately using polymorphic relations

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,

  -- Core page fields
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_name VARCHAR(255),

  -- Publishing workflow
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- SEO metadata (stored as JSONB)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- i18n support
  locale VARCHAR(10) DEFAULT 'en',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX pages_document_id_idx ON pages(document_id);
CREATE INDEX pages_slug_idx ON pages(slug);
CREATE INDEX pages_status_idx ON pages(status);
CREATE INDEX pages_locale_idx ON pages(locale);
CREATE INDEX pages_created_by_idx ON pages(created_by);
CREATE INDEX pages_updated_by_idx ON pages(updated_by);

-- Trigger for updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. SECTION TYPE DEFINITIONS
-- ============================================================================
-- Defines available section types (like Strapi components)

CREATE TABLE section_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  uid VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'sections.hero', 'sections.features'
  name VARCHAR(255) NOT NULL,        -- e.g., 'hero', 'features'
  display_name VARCHAR(255) NOT NULL, -- e.g., 'Hero Section', 'Features'
  category VARCHAR(100) DEFAULT 'sections', -- e.g., 'sections', 'elements'

  -- UI configuration
  icon VARCHAR(50) DEFAULT 'Layout',
  description TEXT,

  -- Schema definition (JSON Schema format)
  schema JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Preview settings
  preview_template TEXT, -- HTML template for preview

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX section_types_uid_idx ON section_types(uid);
CREATE INDEX section_types_category_idx ON section_types(category);
CREATE INDEX section_types_active_idx ON section_types(active);

-- ============================================================================
-- 3. COMPONENT STORAGE TABLES
-- ============================================================================
-- Individual tables for each section type (following Strapi pattern)

-- 3.1 Hero Section
CREATE TABLE components_sections_heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255),
  subtitle TEXT,
  description TEXT,
  label VARCHAR(100),

  -- Buttons (stored as JSONB array)
  buttons JSONB DEFAULT '[]'::jsonb,

  -- Media reference
  picture_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL,
  background_image_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL,

  -- Rich text
  small_text_with_link TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX components_sections_heroes_picture_idx ON components_sections_heroes(picture_id);
CREATE INDEX components_sections_heroes_bg_idx ON components_sections_heroes(background_image_id);

-- 3.2 Feature Rows Group
CREATE TABLE components_sections_feature_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Features stored as JSONB array
  features JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Feature Columns Group
CREATE TABLE components_sections_feature_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Columns stored as JSONB array
  columns JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Testimonials Group
CREATE TABLE components_sections_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Testimonials stored as JSONB array
  testimonials JSONB DEFAULT '[]'::jsonb,

  -- Logos
  logos JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Rich Text Section
CREATE TABLE components_sections_rich_text (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  content TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Pricing Section
CREATE TABLE components_sections_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Pricing tiers stored as JSONB array
  plans JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 Lead Form Section
CREATE TABLE components_sections_lead_form (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,
  submit_button_text VARCHAR(100) DEFAULT 'Submit',

  -- Form fields configuration
  fields JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 Large Video Section
CREATE TABLE components_sections_large_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255),
  description TEXT,
  video_url VARCHAR(500),

  -- Thumbnail
  thumbnail_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX components_sections_large_video_thumbnail_idx ON components_sections_large_video(thumbnail_id);

-- 3.9 Bottom Actions (CTA)
CREATE TABLE components_sections_bottom_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255),
  description TEXT,

  -- Buttons stored as JSONB array
  buttons JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10 Team Section
CREATE TABLE components_sections_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Team members stored as JSONB array
  members JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11 Technology Stack Section
CREATE TABLE components_sections_technology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Technologies stored as JSONB array
  technologies JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12 Contact Section
CREATE TABLE components_sections_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  heading VARCHAR(255),
  subheading TEXT,

  -- Contact information
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,

  -- Social links stored as JSONB
  social_links JSONB DEFAULT '[]'::jsonb,

  -- Map configuration
  show_map BOOLEAN DEFAULT false,
  map_latitude DECIMAL(10, 8),
  map_longitude DECIMAL(11, 8),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. POLYMORPHIC JUNCTION TABLE (CRITICAL)
-- ============================================================================
-- Links pages to sections using Strapi's polymorphic pattern

CREATE TABLE pages_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page reference
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

  -- Polymorphic component reference
  section_id UUID NOT NULL,
  section_type VARCHAR(255) NOT NULL, -- e.g., 'sections.hero', 'sections.features'

  -- Field name (always 'content_sections' for dynamic zone)
  field VARCHAR(255) DEFAULT 'content_sections',

  -- Ordering (FLOAT for flexible reordering)
  display_order FLOAT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX pages_sections_page_id_idx ON pages_sections(page_id);
CREATE INDEX pages_sections_section_id_idx ON pages_sections(section_id);
CREATE INDEX pages_sections_section_type_idx ON pages_sections(section_type);
CREATE INDEX pages_sections_order_idx ON pages_sections(display_order);
CREATE INDEX pages_sections_field_idx ON pages_sections(field);

-- Composite index for efficient queries
CREATE INDEX pages_sections_page_field_order_idx ON pages_sections(page_id, field, display_order);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages_sections ENABLE ROW LEVEL SECURITY;

-- Pages policies
CREATE POLICY "Pages are viewable by everyone for published pages"
  ON pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Pages are fully accessible to authenticated users"
  ON pages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Section types policies (read-only for all, write for authenticated)
CREATE POLICY "Section types are viewable by everyone"
  ON section_types FOR SELECT
  USING (active = true);

CREATE POLICY "Section types are editable by authenticated users"
  ON section_types FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Pages-sections junction table policies
CREATE POLICY "Page sections are viewable by everyone"
  ON pages_sections FOR SELECT
  USING (true);

CREATE POLICY "Page sections are editable by authenticated users"
  ON pages_sections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Component tables RLS (allow all access)
ALTER TABLE components_sections_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_feature_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_feature_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_rich_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_lead_form ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_large_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_bottom_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_technology ENABLE ROW LEVEL SECURITY;
ALTER TABLE components_sections_contact ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone, write to authenticated
DO $$
DECLARE
  component_table TEXT;
BEGIN
  FOR component_table IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE 'components_sections_%'
  LOOP
    EXECUTE format('CREATE POLICY "%s_select_policy" ON %I FOR SELECT USING (true)', component_table, component_table);
    EXECUTE format('CREATE POLICY "%s_write_policy" ON %I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')', component_table, component_table);
  END LOOP;
END $$;

-- ============================================================================
-- 6. SEED DATA
-- ============================================================================

-- Insert section type definitions
INSERT INTO section_types (uid, name, display_name, category, icon, description, schema) VALUES
('sections.hero', 'hero', 'Hero Section', 'sections', 'Sparkles', 'Large hero section with title, description, and CTA buttons',
  '{"type":"object","properties":{"title":{"type":"string"},"subtitle":{"type":"string"},"description":{"type":"string"},"label":{"type":"string"},"buttons":{"type":"array"},"picture_id":{"type":"string","format":"uuid"},"background_image_id":{"type":"string","format":"uuid"}}}'::jsonb),

('sections.feature_rows', 'feature_rows', 'Feature Rows', 'sections', 'List', 'Display features in horizontal rows',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"features":{"type":"array"}}}'::jsonb),

('sections.feature_columns', 'feature_columns', 'Feature Columns', 'sections', 'Columns', 'Display features in vertical columns',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"columns":{"type":"array"}}}'::jsonb),

('sections.testimonials', 'testimonials', 'Testimonials', 'sections', 'MessageSquare', 'Customer testimonials with logos',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"testimonials":{"type":"array"},"logos":{"type":"array"}}}'::jsonb),

('sections.rich_text', 'rich_text', 'Rich Text', 'sections', 'FileText', 'Rich text content block',
  '{"type":"object","properties":{"content":{"type":"string"}}}'::jsonb),

('sections.pricing', 'pricing', 'Pricing Table', 'sections', 'DollarSign', 'Pricing plans and tiers',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"plans":{"type":"array"}}}'::jsonb),

('sections.lead_form', 'lead_form', 'Lead Form', 'sections', 'FormInput', 'Lead capture form',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"submit_button_text":{"type":"string"},"fields":{"type":"array"}}}'::jsonb),

('sections.large_video', 'large_video', 'Large Video', 'sections', 'Video', 'Large video embed',
  '{"type":"object","properties":{"title":{"type":"string"},"description":{"type":"string"},"video_url":{"type":"string"},"thumbnail_id":{"type":"string","format":"uuid"}}}'::jsonb),

('sections.bottom_actions', 'bottom_actions', 'Bottom Actions', 'sections', 'ArrowDown', 'Call-to-action section',
  '{"type":"object","properties":{"title":{"type":"string"},"description":{"type":"string"},"buttons":{"type":"array"}}}'::jsonb),

('sections.team', 'team', 'Team Section', 'sections', 'Users', 'Team members showcase',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"members":{"type":"array"}}}'::jsonb),

('sections.technology', 'technology', 'Technology Stack', 'sections', 'Code', 'Technologies and tools showcase',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"technologies":{"type":"array"}}}'::jsonb),

('sections.contact', 'contact', 'Contact Section', 'sections', 'Mail', 'Contact information and form',
  '{"type":"object","properties":{"heading":{"type":"string"},"subheading":{"type":"string"},"email":{"type":"string"},"phone":{"type":"string"},"address":{"type":"string"},"social_links":{"type":"array"},"show_map":{"type":"boolean"},"map_latitude":{"type":"number"},"map_longitude":{"type":"number"}}}'::jsonb);

-- Insert 6 pages
INSERT INTO pages (title, slug, short_name, status, published_at, metadata) VALUES
('Home', 'home', 'Home', 'published', NOW(),
  '{"metaTitle":"CFB Website - Home","metaDescription":"Welcome to CFB Website"}'::jsonb),

('Team', 'team', 'Team', 'published', NOW(),
  '{"metaTitle":"Our Team - CFB Website","metaDescription":"Meet our talented team"}'::jsonb),

('Technology', 'technology', 'Technology', 'published', NOW(),
  '{"metaTitle":"Technology Stack - CFB Website","metaDescription":"Technologies we use"}'::jsonb),

('Pricing', 'pricing', 'Pricing', 'published', NOW(),
  '{"metaTitle":"Pricing - CFB Website","metaDescription":"View our pricing plans"}'::jsonb),

('Contact', 'contact', 'Contact', 'published', NOW(),
  '{"metaTitle":"Contact Us - CFB Website","metaDescription":"Get in touch with us"}'::jsonb),

('About', 'about', 'About', 'published', NOW(),
  '{"metaTitle":"About Us - CFB Website","metaDescription":"Learn more about us"}'::jsonb);

-- Seed Home page with hero section
WITH home_page AS (
  SELECT id FROM pages WHERE slug = 'home'
),
hero_section AS (
  INSERT INTO components_sections_heroes (title, subtitle, description, label, buttons)
  VALUES (
    'Welcome to CFB Website',
    'Build Amazing Things',
    'Get started with our powerful platform to create, manage, and scale your content with ease.',
    'New Release',
    '[{"text":"Get Started","url":"/signup","type":"primary","newTab":false},{"text":"Learn More","url":"/about","type":"secondary","newTab":false}]'::jsonb
  )
  RETURNING id
)
INSERT INTO pages_sections (page_id, section_id, section_type, field, display_order)
SELECT home_page.id, hero_section.id, 'sections.hero', 'content_sections', 1.0
FROM home_page, hero_section;

-- Seed Team page with team section
WITH team_page AS (
  SELECT id FROM pages WHERE slug = 'team'
),
team_section AS (
  INSERT INTO components_sections_team (heading, subheading, members)
  VALUES (
    'Meet Our Team',
    'The talented people behind our success',
    '[{"name":"John Doe","role":"CEO & Founder","bio":"Passionate about technology and innovation","avatar":null},{"name":"Jane Smith","role":"CTO","bio":"Tech enthusiast with 15 years of experience","avatar":null}]'::jsonb
  )
  RETURNING id
)
INSERT INTO pages_sections (page_id, section_id, section_type, field, display_order)
SELECT team_page.id, team_section.id, 'sections.team', 'content_sections', 1.0
FROM team_page, team_section;

-- Seed Technology page with technology section
WITH tech_page AS (
  SELECT id FROM pages WHERE slug = 'technology'
),
tech_section AS (
  INSERT INTO components_sections_technology (heading, subheading, technologies)
  VALUES (
    'Our Technology Stack',
    'Modern tools and frameworks we use',
    '[{"name":"Next.js","description":"React framework for production","icon":"⚛️","url":"https://nextjs.org"},{"name":"TypeScript","description":"Type-safe JavaScript","icon":"📘","url":"https://typescriptlang.org"},{"name":"Supabase","description":"Open source Firebase alternative","icon":"⚡","url":"https://supabase.com"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO pages_sections (page_id, section_id, section_type, field, display_order)
SELECT tech_page.id, tech_section.id, 'sections.technology', 'content_sections', 1.0
FROM tech_page, tech_section;

-- Seed Pricing page with pricing section
WITH pricing_page AS (
  SELECT id FROM pages WHERE slug = 'pricing'
),
pricing_section AS (
  INSERT INTO components_sections_pricing (heading, subheading, plans)
  VALUES (
    'Simple, Transparent Pricing',
    'Choose the plan that works for you',
    '[{"name":"Starter","price":"$29","interval":"month","description":"Perfect for getting started","features":["5 Projects","10GB Storage","Email Support"],"popular":false,"cta_text":"Get Started","cta_url":"/signup?plan=starter"},{"name":"Professional","price":"$99","interval":"month","description":"For growing teams","features":["Unlimited Projects","100GB Storage","Priority Support","Advanced Analytics"],"popular":true,"cta_text":"Get Started","cta_url":"/signup?plan=pro"},{"name":"Enterprise","price":"Custom","interval":"","description":"For large organizations","features":["Everything in Pro","Custom Storage","Dedicated Support","SLA","Custom Integrations"],"popular":false,"cta_text":"Contact Sales","cta_url":"/contact"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO pages_sections (page_id, section_id, section_type, field, display_order)
SELECT pricing_page.id, pricing_section.id, 'sections.pricing', 'content_sections', 1.0
FROM pricing_page, pricing_section;

-- Seed Contact page with contact section
WITH contact_page AS (
  SELECT id FROM pages WHERE slug = 'contact'
),
contact_section AS (
  INSERT INTO components_sections_contact (heading, subheading, email, phone, address, social_links, show_map)
  VALUES (
    'Get In Touch',
    'We would love to hear from you',
    'hello@cfbwebsite.com',
    '+1 (555) 123-4567',
    '123 Main Street, San Francisco, CA 94102',
    '[{"platform":"twitter","url":"https://twitter.com/cfbwebsite","icon":"Twitter"},{"platform":"linkedin","url":"https://linkedin.com/company/cfbwebsite","icon":"Linkedin"},{"platform":"github","url":"https://github.com/cfbwebsite","icon":"Github"}]'::jsonb,
    false
  )
  RETURNING id
)
INSERT INTO pages_sections (page_id, section_id, section_type, field, display_order)
SELECT contact_page.id, contact_section.id, 'sections.contact', 'content_sections', 1.0
FROM contact_page, contact_section;

-- Seed About page with rich text and feature rows
WITH about_page AS (
  SELECT id FROM pages WHERE slug = 'about'
),
rich_text_section AS (
  INSERT INTO components_sections_rich_text (content)
  VALUES (
    '<h2>About CFB Website</h2><p>We are a team of passionate developers and designers committed to building exceptional web experiences. Our mission is to empower businesses with cutting-edge technology solutions.</p><p>Founded in 2024, we have been at the forefront of web development innovation, helping hundreds of companies transform their digital presence.</p>'
  )
  RETURNING id
),
feature_section AS (
  INSERT INTO components_sections_feature_rows (heading, subheading, features)
  VALUES (
    'Why Choose Us',
    'What makes us different',
    '[{"title":"Innovation First","description":"We stay ahead of the curve with the latest technologies and best practices","icon":"Lightbulb","link":{"url":"#","text":"Learn more"}},{"title":"Quality Focused","description":"Every line of code is crafted with care and attention to detail","icon":"Award","link":{"url":"#","text":"Our process"}},{"title":"Customer Success","description":"Your success is our success. We are here to support you every step of the way","icon":"Heart","link":{"url":"#","text":"Contact us"}}]'::jsonb
  )
  RETURNING id
)
INSERT INTO pages_sections (page_id, section_id, section_type, field, display_order)
SELECT about_page.id, rich_text_section.id, 'sections.rich_text', 'content_sections', 1.0
FROM about_page, rich_text_section
UNION ALL
SELECT about_page.id, feature_section.id, 'sections.feature_rows', 'content_sections', 2.0
FROM about_page, feature_section;

COMMENT ON TABLE pages IS 'Main pages table - stores page metadata and scalar fields';
COMMENT ON TABLE section_types IS 'Available section types/components that can be used in pages';
COMMENT ON TABLE pages_sections IS 'Polymorphic junction table linking pages to sections (Strapi pattern)';
COMMENT ON COLUMN pages_sections.section_type IS 'Discriminator field storing section UID (e.g., sections.hero)';
COMMENT ON COLUMN pages_sections.display_order IS 'Float for flexible reordering (can insert between 1.0 and 2.0 with 1.5)';
