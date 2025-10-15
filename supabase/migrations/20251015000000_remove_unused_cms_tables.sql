-- Remove Unused Complex CMS System
-- This migration removes the Strapi-like polymorphic CMS system that was created but never used
-- The website uses translation files and direct component rendering instead

-- Drop all component section tables
DROP TABLE IF EXISTS components_sections_heroes CASCADE;
DROP TABLE IF EXISTS components_sections_feature_rows CASCADE;
DROP TABLE IF EXISTS components_sections_feature_columns CASCADE;
DROP TABLE IF EXISTS components_sections_testimonials CASCADE;
DROP TABLE IF EXISTS components_sections_rich_text CASCADE;
DROP TABLE IF EXISTS components_sections_pricing CASCADE;
DROP TABLE IF EXISTS components_sections_lead_form CASCADE;
DROP TABLE IF EXISTS components_sections_large_video CASCADE;
DROP TABLE IF EXISTS components_sections_bottom_actions CASCADE;
DROP TABLE IF EXISTS components_sections_team CASCADE;
DROP TABLE IF EXISTS components_sections_technology CASCADE;
DROP TABLE IF EXISTS components_sections_contact CASCADE;

-- Drop junction and metadata tables
DROP TABLE IF EXISTS pages_sections CASCADE;
DROP TABLE IF EXISTS section_types CASCADE;
DROP TABLE IF EXISTS pages CASCADE;

COMMENT ON SCHEMA public IS 'Removed unused Strapi-like CMS tables. Content management now uses: (1) Translation files for page text via /admin/content editor, (2) Supabase tables for structured data (treatments, team, etc.)';
