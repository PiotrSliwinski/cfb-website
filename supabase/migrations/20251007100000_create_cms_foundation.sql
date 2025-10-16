-- ============================================================================
-- CMS Foundation Migration
-- Phase 1: Core CMS Tables for Generic Page System
-- ============================================================================

-- ============================================================================
-- 1. CMS PAGES (Main page definitions)
-- ============================================================================
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  template TEXT NOT NULL, -- 'home', 'info', 'legal', 'custom'
  is_published BOOLEAN DEFAULT true,
  is_homepage BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_published ON cms_pages(is_published);

-- ============================================================================
-- 2. CMS PAGE TRANSLATIONS (Multilingual page metadata)
-- ============================================================================
CREATE TABLE cms_page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, language_code)
);

CREATE INDEX idx_cms_page_translations_page ON cms_page_translations(page_id);
CREATE INDEX idx_cms_page_translations_language ON cms_page_translations(language_code);

-- ============================================================================
-- 3. CMS PAGE SECTIONS (Ordered sections for each page)
-- ============================================================================
CREATE TABLE cms_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'features', 'cta', 'text_block', etc.
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}', -- Section-specific settings (layout, colors, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_page_sections_page ON cms_page_sections(page_id);
CREATE INDEX idx_cms_page_sections_type ON cms_page_sections(section_type);
CREATE INDEX idx_cms_page_sections_order ON cms_page_sections(display_order);

-- ============================================================================
-- 4. CMS SECTION TRANSLATIONS (Multilingual section content)
-- ============================================================================
CREATE TABLE cms_section_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES cms_page_sections(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}', -- Flexible JSON content per section type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, language_code)
);

CREATE INDEX idx_cms_section_translations_section ON cms_section_translations(section_id);
CREATE INDEX idx_cms_section_translations_language ON cms_section_translations(language_code);

-- ============================================================================
-- 5. CMS FEATURES (Reusable feature cards)
-- ============================================================================
CREATE TABLE cms_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, -- Lucide icon name
  icon_color TEXT DEFAULT '#0098AA',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_features_slug ON cms_features(slug);
CREATE INDEX idx_cms_features_active ON cms_features(is_active);

-- ============================================================================
-- 6. CMS FEATURE TRANSLATIONS
-- ============================================================================
CREATE TABLE cms_feature_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES cms_features(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, language_code)
);

CREATE INDEX idx_cms_feature_translations_feature ON cms_feature_translations(feature_id);

-- ============================================================================
-- 7. CMS CTA SECTIONS (Reusable call-to-action blocks)
-- ============================================================================
CREATE TABLE cms_cta_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  style TEXT DEFAULT 'primary', -- 'primary', 'secondary', 'urgent'
  button_style TEXT DEFAULT 'filled', -- 'filled', 'outlined', 'text'
  background_color TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_cta_sections_slug ON cms_cta_sections(slug);

-- ============================================================================
-- 8. CMS CTA TRANSLATIONS
-- ============================================================================
CREATE TABLE cms_cta_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_id UUID NOT NULL REFERENCES cms_cta_sections(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  badge TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  secondary_button_text TEXT,
  secondary_button_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cta_id, language_code)
);

CREATE INDEX idx_cms_cta_translations_cta ON cms_cta_translations(cta_id);

-- ============================================================================
-- 9. CMS FAQS (General FAQs, not treatment-specific)
-- ============================================================================
CREATE TABLE cms_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT, -- 'general', 'payments', 'appointments', etc.
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_faqs_category ON cms_faqs(category);

-- ============================================================================
-- 10. CMS FAQ TRANSLATIONS
-- ============================================================================
CREATE TABLE cms_faq_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id UUID NOT NULL REFERENCES cms_faqs(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(faq_id, language_code)
);

CREATE INDEX idx_cms_faq_translations_faq ON cms_faq_translations(faq_id);

-- ============================================================================
-- SEED DATA: Contact Information
-- ============================================================================
-- Contact information table already exists with a different structure
-- from migration 20251006180000_create_contact_information.sql
-- Seed data already provided in that migration, so we skip it here

-- ============================================================================
-- SEED DATA: Home Page
-- ============================================================================
INSERT INTO cms_pages (slug, template, is_homepage, is_published) VALUES
  ('home', 'home', true, true);

-- Get the home page ID for sections
DO $$
DECLARE
  home_page_id UUID;
BEGIN
  SELECT id INTO home_page_id FROM cms_pages WHERE slug = 'home';

  -- Insert home page translations
  INSERT INTO cms_page_translations (page_id, language_code, title, meta_title, meta_description) VALUES
    (home_page_id, 'pt', 'Início', 'Clínica Ferreira Borges - Dentista em Campo de Ourique, Lisboa', 'Clínica dentária em Campo de Ourique, Lisboa. Tratamentos dentários de excelência com 20+ anos de experiência. Marque já a sua consulta.'),
    (home_page_id, 'en', 'Home', 'Clínica Ferreira Borges - Dentist in Campo de Ourique, Lisbon', 'Dental clinic in Campo de Ourique, Lisbon. Excellent dental treatments with 20+ years of experience. Book your appointment now.');

  -- Insert home page sections
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active) VALUES
    (home_page_id, 'hero', 1, true),
    (home_page_id, 'features', 2, true),
    (home_page_id, 'treatments_showcase', 3, true),
    (home_page_id, 'cta', 4, true);

  -- Add hero section translations
  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'badge', 'Clínica de Confiança em Lisboa',
      'title', 'O Seu Sorriso é a Nossa Prioridade',
      'subtitle', 'Cuidados dentários de excelência em Campo de Ourique',
      'description', 'Mais de 20 anos dedicados à saúde oral com equipamentos modernos e uma equipa especializada.',
      'primary_button_text', 'Marcar Consulta',
      'primary_button_url', 'https://booking.clinicaferreiraborges.pt',
      'secondary_button_text', 'Contactar',
      'secondary_button_url', 'tel:+351935189807'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'hero';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'badge', 'Trusted Dental Clinic in Lisbon',
      'title', 'Your Smile is Our Priority',
      'subtitle', 'Excellence in dental care in Campo de Ourique',
      'description', 'Over 20 years dedicated to oral health with modern equipment and a specialized team.',
      'primary_button_text', 'Book Appointment',
      'primary_button_url', 'https://booking.clinicaferreiraborges.pt',
      'secondary_button_text', 'Contact Us',
      'secondary_button_url', 'tel:+351935189807'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'hero';

  -- Add CTA section settings (reference to main-booking CTA)
  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object('cta_slug', 'main-booking')
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'cta';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object('cta_slug', 'main-booking')
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'cta';
END $$;

-- ============================================================================
-- SEED DATA: Sample Features
-- ============================================================================
INSERT INTO cms_features (slug, icon, icon_color, display_order) VALUES
  ('expertise', 'award', '#0098AA', 1),
  ('technology', 'zap', '#0098AA', 2),
  ('location', 'map-pin', '#0098AA', 3),
  ('care', 'heart', '#0098AA', 4);

-- Insert feature translations
DO $$
DECLARE
  expertise_id UUID;
  technology_id UUID;
  location_id UUID;
  care_id UUID;
BEGIN
  SELECT id INTO expertise_id FROM cms_features WHERE slug = 'expertise';
  SELECT id INTO technology_id FROM cms_features WHERE slug = 'technology';
  SELECT id INTO location_id FROM cms_features WHERE slug = 'location';
  SELECT id INTO care_id FROM cms_features WHERE slug = 'care';

  INSERT INTO cms_feature_translations (feature_id, language_code, title, description) VALUES
    (expertise_id, 'pt', '20+ Anos de Experiência', 'Equipa especializada com vasta experiência em medicina dentária'),
    (expertise_id, 'en', '20+ Years of Experience', 'Specialized team with vast experience in dental medicine'),

    (technology_id, 'pt', 'Tecnologia de Ponta', 'Equipamento moderno para diagnósticos precisos e tratamentos eficazes'),
    (technology_id, 'en', 'Cutting-Edge Technology', 'Modern equipment for precise diagnostics and effective treatments'),

    (location_id, 'pt', 'Em Campo de Ourique', 'Localização privilegiada no coração de Lisboa com fácil acesso'),
    (location_id, 'en', 'In Campo de Ourique', 'Prime location in the heart of Lisbon with easy access'),

    (care_id, 'pt', 'Cuidado Personalizado', 'Atendimento humanizado adaptado às suas necessidades específicas'),
    (care_id, 'en', 'Personalized Care', 'Humanized service adapted to your specific needs');
END $$;

-- ============================================================================
-- SEED DATA: Sample CTA
-- ============================================================================
INSERT INTO cms_cta_sections (slug, style, button_style, background_color) VALUES
  ('main-booking', 'primary', 'filled', '#0098AA');

-- Insert CTA translations
DO $$
DECLARE
  cta_id UUID;
BEGIN
  SELECT id INTO cta_id FROM cms_cta_sections WHERE slug = 'main-booking';

  INSERT INTO cms_cta_translations (cta_id, language_code, badge, title, description, button_text, button_url) VALUES
    (cta_id, 'pt', 'Marque Já', 'Pronto para Transformar o Seu Sorriso?', 'Agende a sua consulta hoje e dê o primeiro passo para um sorriso saudável e radiante.', 'Marcar Consulta', 'https://booking.clinicaferreiraborges.pt'),
    (cta_id, 'en', 'Book Now', 'Ready to Transform Your Smile?', 'Schedule your appointment today and take the first step towards a healthy and radiant smile.', 'Book Appointment', 'https://booking.clinicaferreiraborges.pt');
END $$;

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- CMS Pages: Public read, auth write
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pages are viewable by everyone" ON cms_pages FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Pages are manageable by authenticated users" ON cms_pages FOR ALL USING (auth.role() = 'authenticated');

-- Page Translations
ALTER TABLE cms_page_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Page translations are viewable by everyone" ON cms_page_translations FOR SELECT USING (true);
CREATE POLICY "Page translations are manageable by authenticated users" ON cms_page_translations FOR ALL USING (auth.role() = 'authenticated');

-- Page Sections
ALTER TABLE cms_page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sections are viewable by everyone" ON cms_page_sections FOR SELECT USING (true);
CREATE POLICY "Sections are manageable by authenticated users" ON cms_page_sections FOR ALL USING (auth.role() = 'authenticated');

-- Section Translations
ALTER TABLE cms_section_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Section translations are viewable by everyone" ON cms_section_translations FOR SELECT USING (true);
CREATE POLICY "Section translations are manageable by authenticated users" ON cms_section_translations FOR ALL USING (auth.role() = 'authenticated');

-- Features
ALTER TABLE cms_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Features are viewable by everyone" ON cms_features FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Features are manageable by authenticated users" ON cms_features FOR ALL USING (auth.role() = 'authenticated');

-- Feature Translations
ALTER TABLE cms_feature_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feature translations are viewable by everyone" ON cms_feature_translations FOR SELECT USING (true);
CREATE POLICY "Feature translations are manageable by authenticated users" ON cms_feature_translations FOR ALL USING (auth.role() = 'authenticated');

-- CTAs
ALTER TABLE cms_cta_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CTAs are viewable by everyone" ON cms_cta_sections FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "CTAs are manageable by authenticated users" ON cms_cta_sections FOR ALL USING (auth.role() = 'authenticated');

-- CTA Translations
ALTER TABLE cms_cta_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CTA translations are viewable by everyone" ON cms_cta_translations FOR SELECT USING (true);
CREATE POLICY "CTA translations are manageable by authenticated users" ON cms_cta_translations FOR ALL USING (auth.role() = 'authenticated');

-- FAQs
ALTER TABLE cms_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQs are viewable by everyone" ON cms_faqs FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "FAQs are manageable by authenticated users" ON cms_faqs FOR ALL USING (auth.role() = 'authenticated');

-- FAQ Translations
ALTER TABLE cms_faq_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ translations are viewable by everyone" ON cms_faq_translations FOR SELECT USING (true);
CREATE POLICY "FAQ translations are manageable by authenticated users" ON cms_faq_translations FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE cms_pages IS 'Main CMS page definitions with template and publish status';
COMMENT ON TABLE cms_page_sections IS 'Ordered sections for each page with flexible content structure';
COMMENT ON TABLE cms_features IS 'Reusable feature cards that can be used across multiple pages';
COMMENT ON TABLE cms_cta_sections IS 'Reusable call-to-action blocks with customizable styling';
COMMENT ON TABLE cms_faqs IS 'General FAQ items (not treatment-specific)';
