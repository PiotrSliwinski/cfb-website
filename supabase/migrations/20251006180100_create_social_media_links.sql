-- Create social_media_links table
CREATE TABLE IF NOT EXISTS social_media_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(platform)
);

-- Create social_media_link_translations table
CREATE TABLE IF NOT EXISTS social_media_link_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  social_media_link_id UUID NOT NULL REFERENCES social_media_links(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  display_name TEXT,
  hover_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(social_media_link_id, language_code)
);

-- Create indexes
CREATE INDEX idx_social_media_published ON social_media_links(is_published, display_order);
CREATE INDEX idx_social_media_translations_locale ON social_media_link_translations(language_code);

-- Enable Row Level Security (RLS)
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_link_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Social media links viewable by everyone"
  ON social_media_links FOR SELECT
  USING (is_published = true);

CREATE POLICY "Social media link translations viewable by everyone"
  ON social_media_link_translations FOR SELECT
  USING (true);

-- Create policies for authenticated users (admin) to manage
CREATE POLICY "Social media links editable by authenticated users"
  ON social_media_links FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Social media link translations editable by authenticated users"
  ON social_media_link_translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_social_media_links_updated_at
  BEFORE UPDATE ON social_media_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_link_translations_updated_at
  BEFORE UPDATE ON social_media_link_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed social media links
INSERT INTO social_media_links (platform, url, icon_name, display_order, is_published) VALUES
  ('facebook', 'https://facebook.com/clinicaferreiraborges', 'Facebook', 1, true),
  ('instagram', 'https://instagram.com/clinicaferreiraborges', 'Instagram', 2, true);

-- Seed translations for Facebook
INSERT INTO social_media_link_translations (social_media_link_id, language_code, display_name, hover_text) VALUES
  ((SELECT id FROM social_media_links WHERE platform = 'facebook'), 'pt', 'Facebook', 'Siga-nos no Facebook'),
  ((SELECT id FROM social_media_links WHERE platform = 'facebook'), 'en', 'Facebook', 'Follow us on Facebook');

-- Seed translations for Instagram
INSERT INTO social_media_link_translations (social_media_link_id, language_code, display_name, hover_text) VALUES
  ((SELECT id FROM social_media_links WHERE platform = 'instagram'), 'pt', 'Instagram', 'Siga-nos no Instagram'),
  ((SELECT id FROM social_media_links WHERE platform = 'instagram'), 'en', 'Instagram', 'Follow us on Instagram');
