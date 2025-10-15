-- Drop old payment options tables (we'll replace with service prices)
DROP TABLE IF EXISTS payment_option_translations CASCADE;
DROP TABLE IF EXISTS payment_options CASCADE;

-- Create service_prices table
CREATE TABLE IF NOT EXISTS service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service_price_translations table
CREATE TABLE IF NOT EXISTS service_price_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_price_id UUID NOT NULL REFERENCES service_prices(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_price_id, language_code)
);

-- Create indexes
CREATE INDEX idx_service_prices_published ON service_prices(is_published, display_order);
CREATE INDEX idx_service_price_translations_lang ON service_price_translations(language_code);

-- Create updated_at triggers
CREATE TRIGGER update_service_prices_updated_at
  BEFORE UPDATE ON service_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_price_translations_updated_at
  BEFORE UPDATE ON service_price_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update financing_options to add more fields for admin editing
ALTER TABLE financing_options
  ADD COLUMN IF NOT EXISTS description_short TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Seed some example service prices
INSERT INTO service_prices (slug, price_from, price_to, display_order) VALUES
  ('consulta-inicial', 0.00, 0.00, 1),
  ('limpeza-dentaria', 60.00, 100.00, 2),
  ('branqueamento', 250.00, 400.00, 3),
  ('implante-dentario', 800.00, 1200.00, 4),
  ('ortodontia', 2000.00, 4000.00, 5),
  ('aparelho-invisivel', 2500.00, 5000.00, 6);

-- Seed Portuguese translations
INSERT INTO service_price_translations (service_price_id, language_code, title, description)
SELECT
  sp.id,
  'pt',
  CASE sp.slug
    WHEN 'consulta-inicial' THEN 'Consulta Inicial'
    WHEN 'limpeza-dentaria' THEN 'Limpeza Dentária'
    WHEN 'branqueamento' THEN 'Branqueamento Dentário'
    WHEN 'implante-dentario' THEN 'Implante Dentário (por unidade)'
    WHEN 'ortodontia' THEN 'Tratamento Ortodôntico'
    WHEN 'aparelho-invisivel' THEN 'Aparelho Invisível'
  END,
  CASE sp.slug
    WHEN 'consulta-inicial' THEN 'Avaliação completa e plano de tratamento'
    WHEN 'limpeza-dentaria' THEN 'Destartarização com Guided Biofilm Therapy'
    WHEN 'branqueamento' THEN 'Branqueamento profissional em consultório'
    WHEN 'implante-dentario' THEN 'Inclui implante e pilar'
    WHEN 'ortodontia' THEN 'Tratamento completo com aparelho fixo'
    WHEN 'aparelho-invisivel' THEN 'Tratamento completo com alinhadores'
  END
FROM service_prices sp;

-- Seed English translations
INSERT INTO service_price_translations (service_price_id, language_code, title, description)
SELECT
  sp.id,
  'en',
  CASE sp.slug
    WHEN 'consulta-inicial' THEN 'Initial Consultation'
    WHEN 'limpeza-dentaria' THEN 'Dental Cleaning'
    WHEN 'branqueamento' THEN 'Teeth Whitening'
    WHEN 'implante-dentario' THEN 'Dental Implant (per unit)'
    WHEN 'ortodontia' THEN 'Orthodontic Treatment'
    WHEN 'aparelho-invisivel' THEN 'Clear Aligners'
  END,
  CASE sp.slug
    WHEN 'consulta-inicial' THEN 'Complete evaluation and treatment plan'
    WHEN 'limpeza-dentaria' THEN 'Scaling with Guided Biofilm Therapy'
    WHEN 'branqueamento' THEN 'Professional in-office whitening'
    WHEN 'implante-dentario' THEN 'Includes implant and abutment'
    WHEN 'ortodontia' THEN 'Complete treatment with fixed braces'
    WHEN 'aparelho-invisivel' THEN 'Complete treatment with aligners'
  END
FROM service_prices sp;

-- Update existing financing options with more details
UPDATE financing_options
SET
  description_short = CASE slug
    WHEN 'cetelem' THEN 'Parceria oficial Cetelem'
    WHEN 'cofidis' THEN 'Parceria oficial Cofidis'
  END,
  website_url = CASE slug
    WHEN 'cetelem' THEN 'https://www.cetelem.pt'
    WHEN 'cofidis' THEN 'https://www.cofidis.pt'
  END
WHERE slug IN ('cetelem', 'cofidis');
