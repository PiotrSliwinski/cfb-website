-- Add is_popular column to treatments table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- Update some existing treatments to be popular (you can modify these based on your needs)
UPDATE treatments SET is_popular = true WHERE slug IN ('ortodontia', 'branqueamento', 'implantes-dentarios');
