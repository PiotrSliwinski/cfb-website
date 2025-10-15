-- Create Clinic Settings Table
-- Centralizes all clinic contact information and operational details

CREATE TABLE clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Information
  clinic_name VARCHAR(255) DEFAULT 'Clínica Ferreira Borges',
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  postal_code VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Portugal',

  -- Map coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id VARCHAR(255),

  -- Operating Hours (stored as JSONB for flexibility)
  -- Format: {"monday": {"open": "09:00", "close": "19:00", "closed": false}, ...}
  operating_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "19:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "19:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "19:00", "closed": false},
    "thursday": {"open": "09:00", "close": "19:00", "closed": false},
    "friday": {"open": "09:00", "close": "19:00", "closed": false},
    "saturday": {"open": "09:00", "close": "13:00", "closed": false},
    "sunday": {"open": "", "close": "", "closed": true}
  }'::jsonb,

  -- Regulatory Information
  ers_number VARCHAR(50),
  establishment_number VARCHAR(50),
  licence_number VARCHAR(50),

  -- Booking
  booking_url VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_settings_updated_at
  BEFORE UPDATE ON clinic_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read clinic settings
CREATE POLICY "Clinic settings are viewable by everyone"
  ON clinic_settings FOR SELECT
  USING (true);

-- Only authenticated users can update
CREATE POLICY "Clinic settings are editable by authenticated users"
  ON clinic_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default clinic settings
INSERT INTO clinic_settings (
  phone,
  email,
  address_line1,
  address_line2,
  postal_code,
  city,
  latitude,
  longitude,
  ers_number,
  establishment_number,
  licence_number,
  booking_url
) VALUES (
  '935 189 807',
  'geral@clinicaferreiraborges.pt',
  'Rua Ferreira Borges 173C',
  'Campo de Ourique',
  '1350-130',
  'Lisboa',
  38.7194,
  -9.1634,
  '25393',
  'E128470',
  '10984/2015',
  'https://booking.clinicaferreiraborges.pt'
);

COMMENT ON TABLE clinic_settings IS 'Centralized clinic contact information and operational details - editable via admin panel';
