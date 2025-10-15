-- Remove duplicate contact and social settings
-- These are now managed via dedicated collections:
-- - Contact Information collection
-- - Social Media Links collection

DELETE FROM settings WHERE category IN ('contact', 'social');

-- Add comment explaining the change
COMMENT ON TABLE settings IS 'Application settings. Contact info and social links are managed in dedicated collections, not here.';
