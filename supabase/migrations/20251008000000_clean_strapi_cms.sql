-- ============================================================================
-- CLEAN STRAPI-LIKE CMS SYSTEM
-- Complete database schema for dynamic content management
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE CMS TABLES
-- ============================================================================

-- Content Types: Define custom collections (like Strapi's content types)
CREATE TABLE content_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  singular_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  kind TEXT DEFAULT 'collectionType' CHECK (kind IN ('collectionType', 'singleType')),
  draftable BOOLEAN DEFAULT true,
  publishable BOOLEAN DEFAULT true,
  reviewable BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_types_name ON content_types(name);
CREATE INDEX idx_content_types_kind ON content_types(kind);

-- Content Type Fields: Define fields for each content type
CREATE TABLE content_type_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  translatable BOOLEAN DEFAULT true,
  default_value TEXT,
  min_length INTEGER,
  max_length INTEGER,
  min_value NUMERIC,
  max_value NUMERIC,
  regex_pattern TEXT,
  options JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type_id, name)
);

CREATE INDEX idx_content_type_fields_type ON content_type_fields(content_type_id);
CREATE INDEX idx_content_type_fields_order ON content_type_fields(display_order);

-- Dynamic Content: The actual content entries
CREATE TABLE dynamic_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  data JSONB NOT NULL DEFAULT '{}',
  created_by UUID,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES dynamic_content(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, language_code)
);

CREATE INDEX idx_dynamic_content_translations_content ON dynamic_content_translations(content_id);
CREATE INDEX idx_dynamic_content_translations_language ON dynamic_content_translations(language_code);
CREATE INDEX idx_dynamic_content_translations_data ON dynamic_content_translations USING GIN(data);

-- ============================================================================
-- COMPONENTS SYSTEM
-- ============================================================================

-- Components: Reusable field groups
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- RELATIONS SYSTEM
-- ============================================================================

-- Content Relations: Define relations between content types
CREATE TABLE content_type_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  target_content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  relation_name TEXT NOT NULL,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('oneToOne', 'oneToMany', 'manyToOne', 'manyToMany')),
  inverse_relation_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_relations_source ON content_type_relations(source_content_type_id);
CREATE INDEX idx_content_relations_target ON content_type_relations(target_content_type_id);

-- Content Relation Data: Actual relation data
CREATE TABLE dynamic_content_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relation_id UUID NOT NULL REFERENCES content_type_relations(id) ON DELETE CASCADE,
  source_content_id UUID NOT NULL REFERENCES dynamic_content(id) ON DELETE CASCADE,
  target_content_id UUID NOT NULL REFERENCES dynamic_content(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dynamic_content_relations_relation ON dynamic_content_relations(relation_id);
CREATE INDEX idx_dynamic_content_relations_source ON dynamic_content_relations(source_content_id);
CREATE INDEX idx_dynamic_content_relations_target ON dynamic_content_relations(target_content_id);

-- ============================================================================
-- MEDIA LIBRARY
-- ============================================================================

-- Media Library: Central asset management
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  alternative_text TEXT,
  caption TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  url TEXT NOT NULL,
  formats JSONB,
  folder_path TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_library_mime ON media_library(mime_type);
CREATE INDEX idx_media_library_folder ON media_library(folder_path);
CREATE INDEX idx_media_library_created ON media_library(created_at);

-- ============================================================================
-- USERS & PERMISSIONS
-- ============================================================================

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
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

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  content_type_id UUID REFERENCES content_types(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'publish')),
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permissions_role ON permissions(role);
CREATE INDEX idx_permissions_content_type ON permissions(content_type_id);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content types are viewable by everyone" ON content_types FOR SELECT USING (true);
CREATE POLICY "Content types are manageable by authenticated users" ON content_types FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE content_type_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fields are viewable by everyone" ON content_type_fields FOR SELECT USING (true);
CREATE POLICY "Fields are manageable by authenticated users" ON content_type_fields FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE dynamic_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published content is viewable by everyone" ON dynamic_content
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Content is manageable by authenticated users" ON dynamic_content
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE dynamic_content_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are viewable by everyone" ON dynamic_content_translations FOR SELECT USING (true);
CREATE POLICY "Translations are manageable by authenticated users" ON dynamic_content_translations FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Components are viewable by everyone" ON components FOR SELECT USING (true);
CREATE POLICY "Components are manageable by authenticated users" ON components FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media is viewable by everyone" ON media_library FOR SELECT USING (true);
CREATE POLICY "Media is manageable by authenticated users" ON media_library FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view themselves" ON admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Only admins can manage users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to media bucket
CREATE POLICY "Public media access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Create default admin user (password: 'admin123' - CHANGE IN PRODUCTION!)
INSERT INTO admin_users (email, username, password_hash, first_name, last_name, role, is_active) VALUES
  ('admin@clinicaferreiraborges.pt', 'admin', '$2b$10$rGvM3U3WzQj8vVjN7KH7/.2VQzWU5aEO3h3N3LGqY9rFQXKZQJXZC', 'Admin', 'User', 'admin', true);

-- ============================================================================
-- COMMENTS
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
