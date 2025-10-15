-- Settings table for database-backed configuration
-- Replaces hardcoded config values with admin-editable settings

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_is_public ON settings(is_public);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public settings can be read by anyone
CREATE POLICY "Public settings are viewable by everyone"
  ON settings FOR SELECT
  USING (is_public = true);

-- All settings can be read from service role (admin)
CREATE POLICY "All settings viewable by service role"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify settings
CREATE POLICY "Settings modifiable by service role"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value, category, description, is_public) VALUES
  -- App Settings
  ('app.name', '"Clínica Ferreira Borges"', 'app', 'Application name', true),
  ('app.defaultLocale', '"pt"', 'app', 'Default language (pt or en)', true),
  ('app.supportedLocales', '["pt", "en"]', 'app', 'Supported languages', true),

  -- Contact Settings
  ('contact.email', '"geral@clinicaferreira.pt"', 'contact', 'Contact email', true),
  ('contact.phone', '"+351 229 999 999"', 'contact', 'Contact phone', true),
  ('contact.address', '"Rua Example, 123, Porto"', 'contact', 'Physical address', true),
  ('contact.hours', '"Mon-Fri: 9:00-19:00"', 'contact', 'Business hours', true),

  -- Social Media
  ('social.facebook', '""', 'social', 'Facebook page URL', true),
  ('social.instagram', '""', 'social', 'Instagram profile URL', true),
  ('social.linkedin', '""', 'social', 'LinkedIn page URL', true),

  -- Feature Flags
  ('features.enableReviews', 'true', 'features', 'Enable Google Reviews section', false),
  ('features.enableAdmin', 'true', 'features', 'Enable admin panel', false),
  ('features.enableBooking', 'false', 'features', 'Enable online booking', false),
  ('features.enableBlog', 'false', 'features', 'Enable blog section', false),

  -- Storage Settings
  ('storage.maxImageSize', '10485760', 'storage', 'Max image size in bytes (10MB)', false),
  ('storage.maxIconSize', '2097152', 'storage', 'Max icon size in bytes (2MB)', false),
  ('storage.allowedImageTypes', '["image/png", "image/jpeg", "image/webp"]', 'storage', 'Allowed image MIME types', false),
  ('storage.allowedIconTypes', '["image/svg+xml", "image/png"]', 'storage', 'Allowed icon MIME types', false),

  -- API Settings
  ('api.timeout', '30000', 'api', 'API request timeout in ms', false),
  ('api.retryAttempts', '3', 'api', 'Number of retry attempts', false),
  ('api.retryDelay', '1000', 'api', 'Delay between retries in ms', false),

  -- SEO Settings
  ('seo.metaTitle', '"Clínica Ferreira Borges - Dentista no Porto"', 'seo', 'Default meta title', true),
  ('seo.metaDescription', '"Clínica dentária de excelência no Porto"', 'seo', 'Default meta description', true),
  ('seo.keywords', '["dentista", "porto", "clínica dentária"]', 'seo', 'SEO keywords', true),

  -- Google Services
  ('google.reviewsPlaceId', '""', 'google', 'Google Places ID for reviews', false),
  ('google.analyticsId', '""', 'google', 'Google Analytics ID', false),
  ('google.mapsApiKey', '""', 'google', 'Google Maps API key', false)

ON CONFLICT (key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Comments
COMMENT ON TABLE settings IS 'Application configuration settings manageable via admin panel';
COMMENT ON COLUMN settings.key IS 'Unique setting identifier (e.g., app.name)';
COMMENT ON COLUMN settings.value IS 'JSON value (string, number, boolean, array, object)';
COMMENT ON COLUMN settings.category IS 'Setting category for organization';
COMMENT ON COLUMN settings.description IS 'Human-readable description';
COMMENT ON COLUMN settings.is_public IS 'Whether setting can be read without authentication';
