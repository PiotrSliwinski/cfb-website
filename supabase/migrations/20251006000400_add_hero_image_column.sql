-- Add hero_image_url column to treatments table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN treatments.hero_image_url IS 'URL to the hero/banner image for the treatment page';
