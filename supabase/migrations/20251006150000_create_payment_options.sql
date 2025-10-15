-- Create payment_options table
CREATE TABLE IF NOT EXISTS payment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_option_translations table
CREATE TABLE IF NOT EXISTS payment_option_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_option_id UUID NOT NULL REFERENCES payment_options(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(payment_option_id, language_code)
);

-- Create financing_options table
CREATE TABLE IF NOT EXISTS financing_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  provider_name TEXT,
  provider_logo TEXT,
  min_amount DECIMAL(10,2),
  max_amount DECIMAL(10,2),
  min_installments INTEGER,
  max_installments INTEGER,
  interest_rate DECIMAL(5,2),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create financing_option_translations table
CREATE TABLE IF NOT EXISTS financing_option_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financing_option_id UUID NOT NULL REFERENCES financing_options(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(financing_option_id, language_code)
);

-- Create indexes for better performance
CREATE INDEX idx_payment_options_published ON payment_options(is_published, display_order);
CREATE INDEX idx_payment_option_translations_lang ON payment_option_translations(language_code);
CREATE INDEX idx_financing_options_published ON financing_options(is_published, display_order);
CREATE INDEX idx_financing_option_translations_lang ON financing_option_translations(language_code);

-- Create updated_at triggers
CREATE TRIGGER update_payment_options_updated_at
  BEFORE UPDATE ON payment_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_option_translations_updated_at
  BEFORE UPDATE ON payment_option_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financing_options_updated_at
  BEFORE UPDATE ON financing_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financing_option_translations_updated_at
  BEFORE UPDATE ON financing_option_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed payment options
INSERT INTO payment_options (slug, icon, display_order) VALUES
  ('cash', 'banknotes', 1),
  ('debit-card', 'credit-card', 2),
  ('credit-card', 'credit-card', 3),
  ('bank-transfer', 'building-columns', 4),
  ('mbway', 'mobile-screen', 5);

-- Seed payment option translations (Portuguese)
INSERT INTO payment_option_translations (payment_option_id, language_code, title, description, features)
SELECT
  po.id,
  'pt',
  CASE po.slug
    WHEN 'cash' THEN 'Pagamento em Dinheiro'
    WHEN 'debit-card' THEN 'Cartão de Débito'
    WHEN 'credit-card' THEN 'Cartão de Crédito'
    WHEN 'bank-transfer' THEN 'Transferência Bancária'
    WHEN 'mbway' THEN 'MB WAY'
  END,
  CASE po.slug
    WHEN 'cash' THEN 'Aceitamos pagamento em dinheiro na clínica.'
    WHEN 'debit-card' THEN 'Aceitamos todos os principais cartões de débito.'
    WHEN 'credit-card' THEN 'Aceitamos todos os principais cartões de crédito.'
    WHEN 'bank-transfer' THEN 'Pagamento por transferência bancária disponível.'
    WHEN 'mbway' THEN 'Pagamento rápido e seguro através de MB WAY.'
  END,
  CASE po.slug
    WHEN 'cash' THEN '["Pagamento imediato", "Sem taxas adicionais"]'::jsonb
    WHEN 'debit-card' THEN '["Pagamento imediato", "Seguro e conveniente"]'::jsonb
    WHEN 'credit-card' THEN '["Visa, Mastercard, American Express", "Pagamento seguro"]'::jsonb
    WHEN 'bank-transfer' THEN '["Transferência SEPA", "Confirmação em 1-2 dias úteis"]'::jsonb
    WHEN 'mbway' THEN '["Pagamento instantâneo", "Aplicação móvel"]'::jsonb
  END
FROM payment_options po;

-- Seed payment option translations (English)
INSERT INTO payment_option_translations (payment_option_id, language_code, title, description, features)
SELECT
  po.id,
  'en',
  CASE po.slug
    WHEN 'cash' THEN 'Cash Payment'
    WHEN 'debit-card' THEN 'Debit Card'
    WHEN 'credit-card' THEN 'Credit Card'
    WHEN 'bank-transfer' THEN 'Bank Transfer'
    WHEN 'mbway' THEN 'MB WAY'
  END,
  CASE po.slug
    WHEN 'cash' THEN 'We accept cash payments at the clinic.'
    WHEN 'debit-card' THEN 'We accept all major debit cards.'
    WHEN 'credit-card' THEN 'We accept all major credit cards.'
    WHEN 'bank-transfer' THEN 'Bank transfer payment available.'
    WHEN 'mbway' THEN 'Fast and secure payment via MB WAY.'
  END,
  CASE po.slug
    WHEN 'cash' THEN '["Immediate payment", "No additional fees"]'::jsonb
    WHEN 'debit-card' THEN '["Immediate payment", "Safe and convenient"]'::jsonb
    WHEN 'credit-card' THEN '["Visa, Mastercard, American Express", "Secure payment"]'::jsonb
    WHEN 'bank-transfer' THEN '["SEPA transfer", "Confirmation in 1-2 business days"]'::jsonb
    WHEN 'mbway' THEN '["Instant payment", "Mobile app"]'::jsonb
  END
FROM payment_options po;

-- Seed financing options
INSERT INTO financing_options (slug, provider_name, min_amount, max_amount, min_installments, max_installments, interest_rate, display_order) VALUES
  ('cetelem', 'Cetelem', 300.00, 75000.00, 6, 96, 0.00, 1),
  ('cofidis', 'Cofidis', 500.00, 50000.00, 6, 84, 0.00, 2);

-- Seed financing option translations (Portuguese)
INSERT INTO financing_option_translations (financing_option_id, language_code, title, description, terms)
SELECT
  fo.id,
  'pt',
  CASE fo.slug
    WHEN 'cetelem' THEN 'Financiamento Cetelem'
    WHEN 'cofidis' THEN 'Financiamento Cofidis'
  END,
  CASE fo.slug
    WHEN 'cetelem' THEN 'Parceria com Cetelem para facilitar o acesso aos seus tratamentos dentários.'
    WHEN 'cofidis' THEN 'Soluções de financiamento flexíveis através da Cofidis.'
  END,
  CASE fo.slug
    WHEN 'cetelem' THEN 'Montantes de 300€ a 75.000€. Prazo de 6 a 96 meses. TAEG variável. Sujeito a aprovação.'
    WHEN 'cofidis' THEN 'Montantes de 500€ a 50.000€. Prazo de 6 a 84 meses. TAEG variável. Sujeito a aprovação.'
  END
FROM financing_options fo;

-- Seed financing option translations (English)
INSERT INTO financing_option_translations (financing_option_id, language_code, title, description, terms)
SELECT
  fo.id,
  'en',
  CASE fo.slug
    WHEN 'cetelem' THEN 'Cetelem Financing'
    WHEN 'cofidis' THEN 'Cofidis Financing'
  END,
  CASE fo.slug
    WHEN 'cetelem' THEN 'Partnership with Cetelem to facilitate access to your dental treatments.'
    WHEN 'cofidis' THEN 'Flexible financing solutions through Cofidis.'
  END,
  CASE fo.slug
    WHEN 'cetelem' THEN 'Amounts from €300 to €75,000. Term from 6 to 96 months. Variable APR. Subject to approval.'
    WHEN 'cofidis' THEN 'Amounts from €500 to €50,000. Term from 6 to 84 months. Variable APR. Subject to approval.'
  END
FROM financing_options fo;
