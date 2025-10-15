-- Create cta_sections table
CREATE TABLE IF NOT EXISTS cta_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  section_identifier VARCHAR(255) NOT NULL,
  background_color VARCHAR(50),
  background_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cta_section_translations table
CREATE TABLE IF NOT EXISTS cta_section_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_section_id UUID NOT NULL REFERENCES cta_sections(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  heading TEXT NOT NULL,
  subheading TEXT,
  primary_button_text VARCHAR(255),
  primary_button_url TEXT,
  secondary_button_text VARCHAR(255),
  secondary_button_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(cta_section_id, language_code)
);

-- Create indexes
CREATE INDEX idx_cta_sections_identifier ON cta_sections(section_identifier);
CREATE INDEX idx_cta_sections_published ON cta_sections(is_published, display_order);
CREATE INDEX idx_cta_section_translations_locale ON cta_section_translations(language_code);

-- Enable Row Level Security (RLS)
ALTER TABLE cta_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_section_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "CTA sections viewable by everyone"
  ON cta_sections FOR SELECT
  USING (is_published = true);

CREATE POLICY "CTA section translations viewable by everyone"
  ON cta_section_translations FOR SELECT
  USING (true);

-- Create policies for authenticated users (admin) to manage
CREATE POLICY "CTA sections editable by authenticated users"
  ON cta_sections FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "CTA section translations editable by authenticated users"
  ON cta_section_translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_cta_sections_updated_at
  BEFORE UPDATE ON cta_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cta_section_translations_updated_at
  BEFORE UPDATE ON cta_section_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed CTA sections
INSERT INTO cta_sections (slug, section_identifier, background_color, display_order, is_published) VALUES
  ('team-bottom-cta', 'team-bottom', '#667eea', 1, true),
  ('payments-bottom-cta', 'payments-bottom', '#4facfe', 1, true),
  ('treatment-bottom-cta', 'treatment-bottom', '#667eea', 1, true),
  ('general-booking-cta', 'general-booking', '#f093fb', 1, true);

-- Seed translations for Team bottom CTA
INSERT INTO cta_section_translations (cta_section_id, language_code, heading, subheading, primary_button_text, primary_button_url, secondary_button_text, secondary_button_url) VALUES
  ((SELECT id FROM cta_sections WHERE slug = 'team-bottom-cta'), 'pt',
   'Agende a sua consulta',
   'Entre em contacto connosco hoje mesmo e descubra como podemos ajudar a transformar o seu sorriso.',
   'Marcar Consulta',
   'https://booking.clinicaferreiraborges.pt',
   'Contactar-nos',
   '/pt/localizacao'),
  ((SELECT id FROM cta_sections WHERE slug = 'team-bottom-cta'), 'en',
   'Schedule your appointment',
   'Contact us today and discover how we can help transform your smile.',
   'Book Appointment',
   'https://booking.clinicaferreiraborges.pt',
   'Contact Us',
   '/en/localizacao');

-- Seed translations for Payments bottom CTA
INSERT INTO cta_section_translations (cta_section_id, language_code, heading, subheading, primary_button_text, primary_button_url) VALUES
  ((SELECT id FROM cta_sections WHERE slug = 'payments-bottom-cta'), 'pt',
   'Pronto para começar?',
   'Agende a sua consulta hoje e descubra as melhores opções de pagamento para o seu tratamento.',
   'Marcar Consulta',
   'https://booking.clinicaferreiraborges.pt'),
  ((SELECT id FROM cta_sections WHERE slug = 'payments-bottom-cta'), 'en',
   'Ready to get started?',
   'Book your appointment today and discover the best payment options for your treatment.',
   'Book Appointment',
   'https://booking.clinicaferreiraborges.pt');

-- Seed translations for Treatment bottom CTA
INSERT INTO cta_section_translations (cta_section_id, language_code, heading, subheading, primary_button_text, primary_button_url, secondary_button_text, secondary_button_url) VALUES
  ((SELECT id FROM cta_sections WHERE slug = 'treatment-bottom-cta'), 'pt',
   'Pronto para começar?',
   'Agende a sua consulta hoje e descubra como podemos ajudar.',
   'Marcar Consulta Gratuita',
   'https://booking.clinicaferreiraborges.pt',
   'Ver Outros Tratamentos',
   '/pt'),
  ((SELECT id FROM cta_sections WHERE slug = 'treatment-bottom-cta'), 'en',
   'Ready to get started?',
   'Book your appointment today and discover how we can help.',
   'Book Free Consultation',
   'https://booking.clinicaferreiraborges.pt',
   'View Other Treatments',
   '/en');

-- Seed translations for General booking CTA
INSERT INTO cta_section_translations (cta_section_id, language_code, heading, subheading, primary_button_text, primary_button_url) VALUES
  ((SELECT id FROM cta_sections WHERE slug = 'general-booking-cta'), 'pt',
   'Transforme o seu sorriso hoje',
   'Agende uma consulta gratuita e comece a sua jornada para um sorriso perfeito.',
   'Marcar Consulta Gratuita',
   'https://booking.clinicaferreiraborges.pt'),
  ((SELECT id FROM cta_sections WHERE slug = 'general-booking-cta'), 'en',
   'Transform your smile today',
   'Schedule a free consultation and start your journey to a perfect smile.',
   'Book Free Consultation',
   'https://booking.clinicaferreiraborges.pt');
