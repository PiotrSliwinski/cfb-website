-- Create contact_information table
CREATE TABLE IF NOT EXISTS contact_information (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contact_information_translations table
CREATE TABLE IF NOT EXISTS contact_information_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_info_id UUID NOT NULL REFERENCES contact_information(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  business_hours TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(contact_info_id, language_code)
);

-- Create indexes
CREATE INDEX idx_contact_info_primary ON contact_information(is_primary);
CREATE INDEX idx_contact_info_translations_locale ON contact_information_translations(language_code);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_information_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Contact info viewable by everyone"
  ON contact_information FOR SELECT
  USING (true);

CREATE POLICY "Contact info translations viewable by everyone"
  ON contact_information_translations FOR SELECT
  USING (true);

-- Create policies for authenticated users (admin) to manage
CREATE POLICY "Contact info editable by authenticated users"
  ON contact_information FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Contact info translations editable by authenticated users"
  ON contact_information_translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_contact_information_updated_at
  BEFORE UPDATE ON contact_information
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_information_translations_updated_at
  BEFORE UPDATE ON contact_information_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed primary contact information
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
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.7!2d-9.164195!3d38.715682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQyJzU2LjUiTiA5wrAwOSc1MS4xIlc!5e0!3m2!1sen!2spt!4v1234567890',
  true
);

-- Seed translations
INSERT INTO contact_information_translations (
  contact_info_id, language_code, business_hours, additional_notes
) VALUES (
  (SELECT id FROM contact_information WHERE is_primary = true),
  'pt',
  'Segunda a Sábado: 10:00 - 20:00',
  'Fechado aos Domingos e Feriados'
), (
  (SELECT id FROM contact_information WHERE is_primary = true),
  'en',
  'Monday to Saturday: 10:00 AM - 8:00 PM',
  'Closed on Sundays and Public Holidays'
);
