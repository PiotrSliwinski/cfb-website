-- Language Management System
-- Allows dynamic addition of new languages via admin panel

CREATE TABLE supported_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Language identification
  code VARCHAR(10) UNIQUE NOT NULL, -- ISO 639-1 code (pt, en, fr, es, etc.)
  name VARCHAR(100) NOT NULL, -- English name (Portuguese, English, etc.)
  native_name VARCHAR(100) NOT NULL, -- Native name (Português, English, etc.)
  flag VARCHAR(10) NOT NULL, -- Emoji flag (🇵🇹, 🇬🇧, etc.)

  -- Status
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Display
  display_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default language
CREATE UNIQUE INDEX idx_one_default_language
  ON supported_languages (is_default)
  WHERE is_default = true;

-- Index for ordering
CREATE INDEX idx_languages_display_order ON supported_languages(display_order);
CREATE INDEX idx_languages_enabled ON supported_languages(enabled);

-- Trigger for updated_at
CREATE TRIGGER update_supported_languages_updated_at
  BEFORE UPDATE ON supported_languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE supported_languages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read languages
CREATE POLICY "Languages are viewable by everyone"
  ON supported_languages FOR SELECT
  USING (true);

-- Only authenticated users can modify
CREATE POLICY "Languages are editable by authenticated users"
  ON supported_languages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed default languages
INSERT INTO supported_languages (code, name, native_name, flag, enabled, is_default, display_order) VALUES
  ('pt', 'Portuguese', 'Português', '🇵🇹', true, true, 1),
  ('en', 'English', 'English', '🇬🇧', true, false, 2)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE supported_languages IS 'Dynamically managed languages - add new languages via /admin/settings/languages';
COMMENT ON COLUMN supported_languages.code IS 'ISO 639-1 language code';
COMMENT ON COLUMN supported_languages.is_default IS 'Only one language can be default at a time';
