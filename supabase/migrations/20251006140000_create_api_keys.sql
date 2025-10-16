-- API Keys table for secure storage of third-party API credentials
-- Separate from settings for enhanced security

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  key_value TEXT NOT NULL,
  service VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_keys_service ON api_keys(service);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies - Only authenticated users can access API keys
CREATE POLICY "API keys viewable by authenticated users"
  ON api_keys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "API keys modifiable by authenticated users"
  ON api_keys FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default API keys from environment variables
-- These will be created with placeholder values
INSERT INTO api_keys (name, key_value, service, description, is_active) VALUES
  -- Supabase
  ('NEXT_PUBLIC_SUPABASE_URL', '', 'supabase', 'Supabase project URL', true),
  ('NEXT_PUBLIC_SUPABASE_ANON_KEY', '', 'supabase', 'Supabase anonymous key', true),
  ('SUPABASE_SERVICE_ROLE_KEY', '', 'supabase', 'Supabase service role key (sensitive)', true),

  -- Google Services
  ('GOOGLE_PLACES_API_KEY', '', 'google', 'Google Places API key for reviews', true),
  ('GOOGLE_MAPS_API_KEY', '', 'google', 'Google Maps API key', true),
  ('GOOGLE_ANALYTICS_ID', '', 'google', 'Google Analytics tracking ID', true),

  -- Email Services
  ('SMTP_HOST', '', 'email', 'SMTP server host', true),
  ('SMTP_PORT', '', 'email', 'SMTP server port', true),
  ('SMTP_USER', '', 'email', 'SMTP username', true),
  ('SMTP_PASSWORD', '', 'email', 'SMTP password (sensitive)', true),

  -- Other Services
  ('OPENAI_API_KEY', '', 'ai', 'OpenAI API key (optional)', false),
  ('STRIPE_PUBLISHABLE_KEY', '', 'payment', 'Stripe publishable key (optional)', false),
  ('STRIPE_SECRET_KEY', '', 'payment', 'Stripe secret key (optional, sensitive)', false)

ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();

-- Comments
COMMENT ON TABLE api_keys IS 'Secure storage for third-party API keys and credentials';
COMMENT ON COLUMN api_keys.name IS 'Unique key name (matches environment variable name)';
COMMENT ON COLUMN api_keys.key_value IS 'The actual API key or credential value';
COMMENT ON COLUMN api_keys.service IS 'Service provider (google, supabase, email, etc.)';
COMMENT ON COLUMN api_keys.description IS 'Human-readable description of what this key is for';
COMMENT ON COLUMN api_keys.is_active IS 'Whether this key is currently being used';
COMMENT ON COLUMN api_keys.last_used_at IS 'Timestamp of last usage (for auditing)';
