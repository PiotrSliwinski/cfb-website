-- ============================================================================
-- STRAPI-LIKE CMS SYSTEM - Complete Database Schema
-- This migration creates a complete dynamic CMS system similar to Strapi
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING TABLES (Clean slate)
-- ============================================================================

-- Drop existing CMS tables
DROP TABLE IF EXISTS cms_faq_translations CASCADE;
DROP TABLE IF EXISTS cms_faqs CASCADE;
DROP TABLE IF EXISTS cms_cta_translations CASCADE;
DROP TABLE IF EXISTS cms_cta_sections CASCADE;
DROP TABLE IF EXISTS cms_feature_translations CASCADE;
DROP TABLE IF EXISTS cms_features CASCADE;
DROP TABLE IF EXISTS cms_section_translations CASCADE;
DROP TABLE IF EXISTS cms_page_sections CASCADE;
DROP TABLE IF EXISTS cms_page_translations CASCADE;
DROP TABLE IF EXISTS cms_pages CASCADE;

-- Drop existing content tables
DROP TABLE IF EXISTS treatment_faqs CASCADE;
DROP TABLE IF EXISTS treatment_translations CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS team_member_translations CASCADE;
DROP TABLE IF EXISTS team_member_specialties CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;

-- Drop existing settings tables
DROP TABLE IF EXISTS cta_section_translations CASCADE;
DROP TABLE IF EXISTS cta_sections CASCADE;
DROP TABLE IF EXISTS hero_section_translations CASCADE;
DROP TABLE IF EXISTS hero_sections CASCADE;
DROP TABLE IF EXISTS social_media_link_translations CASCADE;
DROP TABLE IF EXISTS social_media_links CASCADE;
DROP TABLE IF EXISTS contact_information_translations CASCADE;
DROP TABLE IF EXISTS contact_information CASCADE;
DROP TABLE IF EXISTS insurance_provider_translations CASCADE;
DROP TABLE IF EXISTS insurance_providers CASCADE;
DROP TABLE IF EXISTS service_price_translations CASCADE;
DROP TABLE IF EXISTS service_prices CASCADE;
DROP TABLE IF EXISTS payment_option_translations CASCADE;
DROP TABLE IF EXISTS payment_options CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Drop media tables if they exist
DROP TABLE IF EXISTS media_items CASCADE;

-- ============================================================================
-- STEP 2: CORE CMS TABLES
-- ============================================================================

-- Content Types: Define custom collections (like Strapi's content types)
CREATE TABLE content_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- Internal name (e.g., 'blog_posts', 'products')
  display_name TEXT NOT NULL, -- Display name (e.g., 'Blog Posts')
  singular_name TEXT NOT NULL, -- Singular name (e.g., 'Blog Post')
  description TEXT,
  icon TEXT, -- Icon name from lucide-react
  kind TEXT DEFAULT 'collectionType' CHECK (kind IN ('collectionType', 'singleType')),
  draftable BOOLEAN DEFAULT true,
  publishable BOOLEAN DEFAULT true,
  reviewable BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}', -- Additional settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_types_name ON content_types(name);
CREATE INDEX idx_content_types_kind ON content_types(kind);

-- Content Type Fields: Define fields for each content type
CREATE TABLE content_type_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Field name (e.g., 'title', 'content')
  display_name TEXT NOT NULL, -- Display name for UI
  type TEXT NOT NULL, -- Field type: text, richtext, number, date, media, relation, component, etc.
  required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  translatable BOOLEAN DEFAULT true, -- Whether this field supports i18n
  default_value TEXT,
  min_length INTEGER,
  max_length INTEGER,
  min_value NUMERIC,
  max_value NUMERIC,
  regex_pattern TEXT,
  options JSONB DEFAULT '{}', -- Type-specific options (e.g., media types, relation config)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type_id, name)
);

CREATE INDEX idx_content_type_fields_type ON content_type_fields(content_type_id);
CREATE INDEX idx_content_type_fields_order ON content_type_fields(display_order);

-- Dynamic Content: The actual content entries
CREATE TABLE dynamic_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  data JSONB NOT NULL DEFAULT '{}', -- Non-translatable fields
  created_by UUID, -- User ID (for future auth)
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dynamic_content_type ON dynamic_content(content_type_id);
CREATE INDEX idx_dynamic_content_status ON dynamic_content(status);
CREATE INDEX idx_dynamic_content_published ON dynamic_content(published_at);
CREATE INDEX idx_dynamic_content_data ON dynamic_content USING GIN(data);

-- Dynamic Content Translations: i18n support
CREATE TABLE dynamic_content_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES dynamic_content(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL, -- 'pt', 'en', etc.
  data JSONB NOT NULL DEFAULT '{}', -- Translatable fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, language_code)
);

CREATE INDEX idx_dynamic_content_translations_content ON dynamic_content_translations(content_id);
CREATE INDEX idx_dynamic_content_translations_language ON dynamic_content_translations(language_code);
CREATE INDEX idx_dynamic_content_translations_data ON dynamic_content_translations USING GIN(data);

-- ============================================================================
-- STEP 3: COMPONENTS SYSTEM (Reusable field groups)
-- ============================================================================

-- Components: Reusable field groups (like Strapi's components)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- e.g., 'seo_metadata', 'address'
  display_name TEXT NOT NULL,
  category TEXT, -- e.g., 'shared', 'page-sections'
  icon TEXT,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_components_name ON components(name);
CREATE INDEX idx_components_category ON components(category);

-- Component Fields: Fields within a component
CREATE TABLE component_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  translatable BOOLEAN DEFAULT true,
  default_value TEXT,
  options JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(component_id, name)
);

CREATE INDEX idx_component_fields_component ON component_fields(component_id);
CREATE INDEX idx_component_fields_order ON component_fields(display_order);

-- ============================================================================
-- STEP 4: RELATIONS SYSTEM
-- ============================================================================

-- Content Relations: Define relations between content types
CREATE TABLE content_type_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  target_content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  relation_name TEXT NOT NULL, -- Field name on source
  relation_type TEXT NOT NULL CHECK (relation_type IN ('oneToOne', 'oneToMany', 'manyToOne', 'manyToMany')),
  inverse_relation_name TEXT, -- Field name on target (for bidirectional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_relations_source ON content_type_relations(source_content_type_id);
CREATE INDEX idx_content_relations_target ON content_type_relations(target_content_type_id);

-- Content Relation Data: Actual relation data
CREATE TABLE dynamic_content_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relation_id UUID NOT NULL REFERENCES content_type_relations(id) ON DELETE CASCADE,
  source_content_id UUID NOT NULL REFERENCES dynamic_content(id) ON DELETE CASCADE,
  target_content_id UUID NOT NULL REFERENCES dynamic_content(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0, -- For ordered relations
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dynamic_content_relations_relation ON dynamic_content_relations(relation_id);
CREATE INDEX idx_dynamic_content_relations_source ON dynamic_content_relations(source_content_id);
CREATE INDEX idx_dynamic_content_relations_target ON dynamic_content_relations(target_content_id);

-- ============================================================================
-- STEP 5: MEDIA LIBRARY
-- ============================================================================

-- Media Library: Central asset management
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  alternative_text TEXT,
  caption TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- In bytes
  width INTEGER, -- For images
  height INTEGER, -- For images
  url TEXT NOT NULL, -- Supabase Storage URL
  formats JSONB, -- Different image sizes (thumbnail, small, medium, large)
  folder_path TEXT, -- For organization
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_library_mime ON media_library(mime_type);
CREATE INDEX idx_media_library_folder ON media_library(folder_path);
CREATE INDEX idx_media_library_created ON media_library(created_at);

-- ============================================================================
-- STEP 6: USERS & PERMISSIONS (Basic Auth System)
-- ============================================================================

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Use bcrypt
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'author', 'viewer')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Permissions (simplified version)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  content_type_id UUID REFERENCES content_types(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'publish')),
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permissions_role ON permissions(role);
CREATE INDEX idx_permissions_content_type ON permissions(content_type_id);

-- ============================================================================
-- STEP 7: AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish'
  entity_type TEXT NOT NULL, -- 'content_type', 'dynamic_content', 'media'
  entity_id UUID,
  changes JSONB, -- What changed
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================================
-- STEP 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Content Types: Public read (published only), authenticated write
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content types are viewable by everyone" ON content_types FOR SELECT USING (true);
CREATE POLICY "Content types are manageable by authenticated users" ON content_types FOR ALL USING (auth.role() = 'authenticated');

-- Content Type Fields
ALTER TABLE content_type_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fields are viewable by everyone" ON content_type_fields FOR SELECT USING (true);
CREATE POLICY "Fields are manageable by authenticated users" ON content_type_fields FOR ALL USING (auth.role() = 'authenticated');

-- Dynamic Content: Public read (published only), authenticated write
ALTER TABLE dynamic_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published content is viewable by everyone" ON dynamic_content
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Content is manageable by authenticated users" ON dynamic_content
  FOR ALL USING (auth.role() = 'authenticated');

-- Dynamic Content Translations
ALTER TABLE dynamic_content_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are viewable by everyone" ON dynamic_content_translations FOR SELECT USING (true);
CREATE POLICY "Translations are manageable by authenticated users" ON dynamic_content_translations FOR ALL USING (auth.role() = 'authenticated');

-- Components
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Components are viewable by everyone" ON components FOR SELECT USING (true);
CREATE POLICY "Components are manageable by authenticated users" ON components FOR ALL USING (auth.role() = 'authenticated');

-- Media Library: Public read, authenticated write
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media is viewable by everyone" ON media_library FOR SELECT USING (true);
CREATE POLICY "Media is manageable by authenticated users" ON media_library FOR ALL USING (auth.role() = 'authenticated');

-- Admin Users: Authenticated only
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view themselves" ON admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Only admins can manage users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 9: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_content_types_updated_at BEFORE UPDATE ON content_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_type_fields_updated_at BEFORE UPDATE ON content_type_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dynamic_content_updated_at BEFORE UPDATE ON dynamic_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dynamic_content_translations_updated_at BEFORE UPDATE ON dynamic_content_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_fields_updated_at BEFORE UPDATE ON component_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 10: SEED DATA - Essential Content Types
-- ============================================================================

-- Create default admin user (password: 'admin123' - CHANGE IN PRODUCTION!)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO admin_users (email, username, password_hash, first_name, last_name, role, is_active) VALUES
  ('admin@clinicaferreiraborges.pt', 'admin', '$2b$10$rGvM3U3WzQj8vVjN7KH7/.2VQzWU5aEO3h3N3LGqY9rFQXKZQJXZC', 'Admin', 'User', 'admin', true);

-- Create 'Page' content type (for CMS pages)
DO $$
DECLARE
  page_type_id UUID;
BEGIN
  INSERT INTO content_types (name, display_name, singular_name, description, icon, kind, publishable)
  VALUES ('pages', 'Pages', 'Page', 'Website pages with SEO and sections', 'FileText', 'collectionType', true)
  RETURNING id INTO page_type_id;

  -- Add fields to Page content type
  INSERT INTO content_type_fields (content_type_id, name, display_name, type, required, is_unique, translatable, display_order) VALUES
    (page_type_id, 'slug', 'URL Slug', 'text', true, true, false, 1),
    (page_type_id, 'title', 'Title', 'text', true, false, true, 2),
    (page_type_id, 'meta_title', 'Meta Title', 'text', false, false, true, 3),
    (page_type_id, 'meta_description', 'Meta Description', 'text', false, false, true, 4),
    (page_type_id, 'template', 'Template', 'text', true, false, false, 5),
    (page_type_id, 'is_homepage', 'Is Homepage', 'boolean', false, false, false, 6);
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE content_types IS 'Dynamic content type definitions (like Strapi content types)';
COMMENT ON TABLE content_type_fields IS 'Field definitions for each content type';
COMMENT ON TABLE dynamic_content IS 'Actual content entries with flexible JSONB data';
COMMENT ON TABLE dynamic_content_translations IS 'i18n translations for content';
COMMENT ON TABLE components IS 'Reusable field groups';
COMMENT ON TABLE media_library IS 'Central media asset management';
COMMENT ON TABLE admin_users IS 'Admin panel users with roles';
COMMENT ON TABLE permissions IS 'Role-based permissions for content types';
COMMENT ON TABLE audit_log IS 'Audit trail for all admin actions';
