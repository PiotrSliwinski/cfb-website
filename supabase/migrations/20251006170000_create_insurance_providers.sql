-- Create insurance_providers table
CREATE TABLE IF NOT EXISTS insurance_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create insurance_provider_translations table
CREATE TABLE IF NOT EXISTS insurance_provider_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  coverage_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(insurance_provider_id, language_code)
);

-- Create indexes for better query performance
CREATE INDEX idx_insurance_providers_published ON insurance_providers(is_published);
CREATE INDEX idx_insurance_providers_display_order ON insurance_providers(display_order);
CREATE INDEX idx_insurance_provider_translations_provider_id ON insurance_provider_translations(insurance_provider_id);
CREATE INDEX idx_insurance_provider_translations_language ON insurance_provider_translations(language_code);

-- Enable RLS
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_provider_translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Insurance providers are viewable by everyone"
  ON insurance_providers FOR SELECT
  USING (is_published = true);

CREATE POLICY "Insurance provider translations are viewable by everyone"
  ON insurance_provider_translations FOR SELECT
  USING (true);

-- Create RLS policies for authenticated admin access
CREATE POLICY "Insurance providers are fully manageable by authenticated users"
  ON insurance_providers FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Insurance provider translations are fully manageable by authenticated users"
  ON insurance_provider_translations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insurance_providers_updated_at BEFORE UPDATE ON insurance_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_provider_translations_updated_at BEFORE UPDATE ON insurance_provider_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some example insurance providers
INSERT INTO insurance_providers (slug, website_url, phone, display_order, is_published) VALUES
  ('medis', 'https://www.medis.pt', '+351 210 303 303', 0, true),
  ('advance-care', 'https://www.advancecare.pt', '+351 707 100 200', 1, true),
  ('multicare', 'https://www.multicare.pt', '+351 707 502 502', 2, true);

-- Seed Portuguese translations
INSERT INTO insurance_provider_translations (insurance_provider_id, language_code, name, description, coverage_details) VALUES
  (
    (SELECT id FROM insurance_providers WHERE slug = 'medis'),
    'pt',
    'Medis',
    'Seguro de saúde com cobertura dentária abrangente',
    'Cobertura de consultas, tratamentos preventivos, restaurações, endodontias e cirurgias orais. Sujeito a franquias e comparticipações conforme plano contratado.'
  ),
  (
    (SELECT id FROM insurance_providers WHERE slug = 'advance-care'),
    'pt',
    'AdvanceCare',
    'Soluções de saúde com rede de prestadores dentários',
    'Acesso à rede de clínicas convencionadas. Cobertura de medicina dentária geral e especializada. Consulte o seu plano para detalhes de comparticipação.'
  ),
  (
    (SELECT id FROM insurance_providers WHERE slug = 'multicare'),
    'pt',
    'Multicare',
    'Seguro de saúde com opções de medicina dentária',
    'Planos com cobertura dentária incluindo consultas, destartarizações, restaurações e tratamentos especializados. Verifique as condições do seu plano.'
  );

-- Seed English translations
INSERT INTO insurance_provider_translations (insurance_provider_id, language_code, name, description, coverage_details) VALUES
  (
    (SELECT id FROM insurance_providers WHERE slug = 'medis'),
    'en',
    'Medis',
    'Health insurance with comprehensive dental coverage',
    'Coverage for consultations, preventive treatments, restorations, endodontics and oral surgeries. Subject to deductibles and co-payments as per contracted plan.'
  ),
  (
    (SELECT id FROM insurance_providers WHERE slug = 'advance-care'),
    'en',
    'AdvanceCare',
    'Health solutions with dental provider network',
    'Access to network of partner clinics. Coverage for general and specialized dentistry. Check your plan for co-payment details.'
  ),
  (
    (SELECT id FROM insurance_providers WHERE slug = 'multicare'),
    'en',
    'Multicare',
    'Health insurance with dental medicine options',
    'Plans with dental coverage including consultations, cleanings, restorations and specialized treatments. Verify your plan conditions.'
  );
