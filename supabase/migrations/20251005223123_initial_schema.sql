-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Languages table
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default languages
INSERT INTO languages (code, name, is_default) VALUES
  ('pt', 'Português', true),
  ('en', 'English', false);

-- Pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug)
);

-- Page translations
CREATE TABLE page_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, language_code)
);

-- Treatments table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon_url TEXT,
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treatment translations
CREATE TABLE treatment_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  benefits JSONB,
  process_steps JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(treatment_id, language_code)
);

-- Treatment FAQs
CREATE TABLE treatment_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE treatment_faq_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID REFERENCES treatment_faqs(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  UNIQUE(faq_id, language_code)
);

-- Team members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  photo_url TEXT,
  display_order INT DEFAULT 0,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_member_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  specialty VARCHAR(255),
  bio TEXT,
  credentials TEXT,
  UNIQUE(member_id, language_code)
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE testimonial_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  testimonial_id UUID REFERENCES testimonials(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  author_name VARCHAR(255),
  content TEXT NOT NULL,
  UNIQUE(testimonial_id, language_code)
);

-- Media gallery
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  alt_text TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  treatment_interest VARCHAR(255),
  language_code VARCHAR(5),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_setting_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_id UUID REFERENCES site_settings(id) ON DELETE CASCADE,
  language_code VARCHAR(5) REFERENCES languages(code),
  value JSONB,
  UNIQUE(setting_id, language_code)
);

-- Enable Row Level Security
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read access for published content)
CREATE POLICY "Public can view published treatments"
  ON treatments FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view published team members"
  ON team_members FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view published testimonials"
  ON testimonials FOR SELECT
  USING (is_published = true);

-- Allow public to insert contact submissions
CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_treatments_slug ON treatments(slug);
CREATE INDEX idx_treatments_published ON treatments(is_published);
CREATE INDEX idx_team_slug ON team_members(slug);
CREATE INDEX idx_page_translations_language ON page_translations(language_code);
CREATE INDEX idx_treatment_translations_language ON treatment_translations(language_code);
CREATE INDEX idx_treatment_translations_treatment ON treatment_translations(treatment_id);
CREATE INDEX idx_team_translations_language ON team_member_translations(language_code);
CREATE INDEX idx_testimonial_published ON testimonials(is_published);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
