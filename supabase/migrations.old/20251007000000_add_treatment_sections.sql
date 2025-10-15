-- Add section visibility controls to treatments table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{
  "hero": {"active": true, "order": 1},
  "benefits": {"active": true, "order": 2},
  "intro": {"active": true, "order": 3},
  "stats": {"active": true, "order": 4},
  "technology": {"active": true, "order": 5},
  "team": {"active": true, "order": 6},
  "whyChoose": {"active": true, "order": 7},
  "process": {"active": true, "order": 8},
  "seoContent": {"active": true, "order": 9},
  "pricing": {"active": true, "order": 10},
  "faqs": {"active": true, "order": 11},
  "urgency": {"active": true, "order": 12},
  "finalCta": {"active": true, "order": 13},
  "seoFooter": {"active": true, "order": 14}
}'::jsonb;

-- Update existing treatments to have the default sections
UPDATE treatments
SET sections = '{
  "hero": {"active": true, "order": 1},
  "benefits": {"active": true, "order": 2},
  "intro": {"active": true, "order": 3},
  "stats": {"active": true, "order": 4},
  "technology": {"active": true, "order": 5},
  "team": {"active": true, "order": 6},
  "whyChoose": {"active": true, "order": 7},
  "process": {"active": true, "order": 8},
  "seoContent": {"active": true, "order": 9},
  "pricing": {"active": true, "order": 10},
  "faqs": {"active": true, "order": 11},
  "urgency": {"active": true, "order": 12},
  "finalCta": {"active": true, "order": 13},
  "seoFooter": {"active": true, "order": 14}
}'::jsonb
WHERE sections IS NULL;

-- Add section content fields to treatment_translations
ALTER TABLE treatment_translations ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN treatments.sections IS 'Controls which sections are active/visible on the treatment page and their display order';
COMMENT ON COLUMN treatment_translations.section_content IS 'Stores editable content for each section (intro text, technology text, team text, etc.)';
