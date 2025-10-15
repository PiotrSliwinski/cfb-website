-- Update treatment icon URLs (using Lucide React icons via component)
-- Icons will be rendered in the frontend using lucide-react

UPDATE treatments SET icon_url = 'activity' WHERE slug = 'implantes-dentarios';
UPDATE treatments SET icon_url = 'smile' WHERE slug = 'aparelho-invisivel';
UPDATE treatments SET icon_url = 'sparkles' WHERE slug = 'branqueamento';
UPDATE treatments SET icon_url = 'align-center' WHERE slug = 'ortodontia';
UPDATE treatments SET icon_url = 'droplet' WHERE slug = 'limpeza-dentaria';

-- Note: icon_url stores the Lucide icon name, not an actual URL
-- The frontend will use these to render <Icon name={treatment.icon_url} />
