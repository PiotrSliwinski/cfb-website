-- Create hero_sections table
CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  page_identifier VARCHAR(255) NOT NULL,
  background_image_url TEXT,
  background_gradient TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create hero_section_translations table
CREATE TABLE IF NOT EXISTS hero_section_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_section_id UUID NOT NULL REFERENCES hero_sections(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  heading TEXT NOT NULL,
  subheading TEXT,
  cta_text VARCHAR(255),
  cta_url TEXT,
  secondary_cta_text VARCHAR(255),
  secondary_cta_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(hero_section_id, language_code)
);

-- Create indexes
CREATE INDEX idx_hero_sections_page ON hero_sections(page_identifier);
CREATE INDEX idx_hero_sections_published ON hero_sections(is_published, display_order);
CREATE INDEX idx_hero_section_translations_locale ON hero_section_translations(language_code);

-- Enable Row Level Security (RLS)
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_section_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Hero sections viewable by everyone"
  ON hero_sections FOR SELECT
  USING (is_published = true);

CREATE POLICY "Hero section translations viewable by everyone"
  ON hero_section_translations FOR SELECT
  USING (true);

-- Create policies for authenticated users (admin) to manage
CREATE POLICY "Hero sections editable by authenticated users"
  ON hero_sections FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Hero section translations editable by authenticated users"
  ON hero_section_translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_section_translations_updated_at
  BEFORE UPDATE ON hero_section_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed hero sections
INSERT INTO hero_sections (slug, page_identifier, background_gradient, display_order, is_published) VALUES
  ('home-hero', 'home', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 1, true),
  ('team-hero', 'team', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 1, true),
  ('payments-hero', 'payments', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 1, true),
  ('location-hero', 'location', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 1, true);

-- Seed translations for Home hero
INSERT INTO hero_section_translations (hero_section_id, language_code, heading, subheading, cta_text, cta_url) VALUES
  ((SELECT id FROM hero_sections WHERE slug = 'home-hero'), 'pt',
   'Onde cada sorriso conta uma história',
   'Na Clínica Ferreira Borges, em Campo de Ourique, Lisboa, acreditamos que cada sorriso é único e merece cuidados personalizados. Com mais de 15 anos de experiência, a nossa equipa de profissionais dedicados está aqui para transformar a sua saúde oral e confiança.',
   'Marcar Consulta',
   'https://booking.clinicaferreiraborges.pt'),
  ((SELECT id FROM hero_sections WHERE slug = 'home-hero'), 'en',
   'Where every smile tells a story',
   'At Clínica Ferreira Borges, in Campo de Ourique, Lisbon, we believe that every smile is unique and deserves personalized care. With over 15 years of experience, our team of dedicated professionals is here to transform your oral health and confidence.',
   'Book Appointment',
   'https://booking.clinicaferreiraborges.pt');

-- Seed translations for Team hero
INSERT INTO hero_section_translations (hero_section_id, language_code, heading, subheading, cta_text, cta_url) VALUES
  ((SELECT id FROM hero_sections WHERE slug = 'team-hero'), 'pt',
   'A Nossa Equipa',
   'Profissionais dedicados ao seu sorriso',
   'Conhecer a Equipa',
   '#team-members'),
  ((SELECT id FROM hero_sections WHERE slug = 'team-hero'), 'en',
   'Our Team',
   'Professionals dedicated to your smile',
   'Meet the Team',
   '#team-members');

-- Seed translations for Payments hero
INSERT INTO hero_section_translations (hero_section_id, language_code, heading, subheading, cta_text, cta_url) VALUES
  ((SELECT id FROM hero_sections WHERE slug = 'payments-hero'), 'pt',
   'Soluções de Pagamento',
   'Facilitamos o acesso aos seus tratamentos dentários',
   'Ver Opções',
   '#financing-options'),
  ((SELECT id FROM hero_sections WHERE slug = 'payments-hero'), 'en',
   'Payment Solutions',
   'We make dental treatments accessible for everyone',
   'View Options',
   '#financing-options');

-- Seed translations for Location hero
INSERT INTO hero_section_translations (hero_section_id, language_code, heading, subheading, cta_text, cta_url) VALUES
  ((SELECT id FROM hero_sections WHERE slug = 'location-hero'), 'pt',
   'Visite-nos',
   'Estamos localizados no coração de Campo de Ourique, Lisboa',
   'Ver Localização',
   '#map'),
  ((SELECT id FROM hero_sections WHERE slug = 'location-hero'), 'en',
   'Visit Us',
   'We are located in the heart of Campo de Ourique, Lisbon',
   'View Location',
   '#map');
