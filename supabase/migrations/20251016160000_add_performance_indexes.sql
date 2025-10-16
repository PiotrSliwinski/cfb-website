-- Migration: Add Performance Indexes for Treatment Queries
-- Date: 2025-10-16
-- Purpose: Optimize treatment page queries that include FAQs and translations

-- ====================
-- Treatment FAQs Indexes
-- ====================

-- Index for joining treatment_faqs with treatments
CREATE INDEX IF NOT EXISTS idx_treatment_faqs_treatment_id
  ON treatment_faqs(treatment_id);

-- Index for ordering FAQs by display_order
CREATE INDEX IF NOT EXISTS idx_treatment_faqs_display_order
  ON treatment_faqs(display_order);

-- Composite index for treatment_id + display_order (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_treatment_faqs_treatment_order
  ON treatment_faqs(treatment_id, display_order);

-- ====================
-- Treatment FAQ Translations Indexes
-- ====================

-- Index for joining treatment_faq_translations with treatment_faqs
CREATE INDEX IF NOT EXISTS idx_treatment_faq_translations_faq_id
  ON treatment_faq_translations(faq_id);

-- Index for filtering by language_code
CREATE INDEX IF NOT EXISTS idx_treatment_faq_translations_language
  ON treatment_faq_translations(language_code);

-- Composite index for faq_id + language_code (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_treatment_faq_translations_faq_language
  ON treatment_faq_translations(faq_id, language_code);

-- ====================
-- Composite Indexes for Complex Queries
-- ====================

-- Composite index for treatments: slug + is_published (getTreatmentBySlug query)
CREATE INDEX IF NOT EXISTS idx_treatments_slug_published
  ON treatments(slug, is_published)
  WHERE is_published = true;

-- Composite index for treatment_translations: treatment_id + language_code
CREATE INDEX IF NOT EXISTS idx_treatment_translations_treatment_language
  ON treatment_translations(treatment_id, language_code);

-- Composite index for treatments: is_published + display_order (getAllTreatments query)
CREATE INDEX IF NOT EXISTS idx_treatments_published_order
  ON treatments(is_published, display_order)
  WHERE is_published = true;

-- ====================
-- Additional Indexes for Other Entities
-- ====================

-- Team member translations composite index
CREATE INDEX IF NOT EXISTS idx_team_member_translations_member_language
  ON team_member_translations(member_id, language_code);

-- Testimonial translations composite index
CREATE INDEX IF NOT EXISTS idx_testimonial_translations_testimonial_language
  ON testimonial_translations(testimonial_id, language_code);

-- Settings key lookup (frequently accessed)
CREATE INDEX IF NOT EXISTS idx_settings_key_public
  ON settings(key, is_public)
  WHERE is_public = true;

-- ====================
-- Analyze Tables
-- ====================

-- Update statistics for the query planner
ANALYZE treatments;
ANALYZE treatment_translations;
ANALYZE treatment_faqs;
ANALYZE treatment_faq_translations;
ANALYZE team_members;
ANALYZE team_member_translations;
ANALYZE testimonials;
ANALYZE testimonial_translations;
ANALYZE settings;

-- ====================
-- Comments
-- ====================

COMMENT ON INDEX idx_treatment_faqs_treatment_order IS
  'Optimizes queries that fetch FAQs for a specific treatment ordered by display_order';

COMMENT ON INDEX idx_treatment_faq_translations_faq_language IS
  'Optimizes queries that fetch FAQ translations for a specific FAQ and language';

COMMENT ON INDEX idx_treatments_slug_published IS
  'Optimizes getTreatmentBySlug queries with partial index on published treatments only';

COMMENT ON INDEX idx_treatments_published_order IS
  'Optimizes getAllTreatments queries with partial index on published treatments only';
