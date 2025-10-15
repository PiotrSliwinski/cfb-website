#!/bin/bash

# Direct SQL script to link photos to team members

PGHOST="127.0.0.1"
PGPORT="54322"
PGDATABASE="cfb-cms"
PGUSER="postgres"
PGPASSWORD="postgres"

export PGPASSWORD

echo "🔗 Linking photos to team members in database..."
echo ""

# First, let's see what team members we have
echo "📋 Current team members:"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "SELECT id, document_id, \"Name\" FROM teams ORDER BY \"Name\";"

echo ""
echo "📸 Uploaded files:"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "SELECT id, name FROM files WHERE id >= 24 ORDER BY id;"

echo ""
echo "🔗 Linking photos..."

# Link photos using teams_image_lnk table
# We need to find the correct team member IDs and link them to file IDs

psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE << 'EOF'

-- First, let's check the teams table structure
\d teams

-- Check the linking table
\d teams_image_lnk

-- Now let's link the photos
-- We'll use the team member names to find IDs and link to file IDs

-- Anna Carolina Ribeiro -> File ID 24
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 24
FROM teams t
WHERE t."Name" = 'Anna Carolina Ribeiro'
ON CONFLICT DO NOTHING;

-- Carlos Sousa -> File ID 25
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 25
FROM teams t
WHERE t."Name" = 'Carlos Sousa'
ON CONFLICT DO NOTHING;

-- Filipa Caeiro -> File ID 26
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 26
FROM teams t
WHERE t."Name" = 'Filipa Caeiro'
ON CONFLICT DO NOTHING;

-- Filipa Cunha -> File ID 27
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 27
FROM teams t
WHERE t."Name" = 'Filipa Cunha'
ON CONFLICT DO NOTHING;

-- Filipa Marques -> File ID 28
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 28
FROM teams t
WHERE t."Name" = 'Filipa Marques'
ON CONFLICT DO NOTHING;

-- Gonçalo Selas -> File ID 29
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 29
FROM teams t
WHERE t."Name" = 'Gonçalo Selas'
ON CONFLICT DO NOTHING;

-- Ronite Harjivan -> File ID 30
INSERT INTO teams_image_lnk (team_id, file_id)
SELECT t.id, 30
FROM teams t
WHERE t."Name" = 'Ronite Harjivan'
ON CONFLICT DO NOTHING;

-- Show results
SELECT t."Name", f.name as photo_file, l.file_id
FROM teams t
JOIN teams_image_lnk l ON t.id = l.team_id
JOIN files f ON l.file_id = f.id
ORDER BY t."Name";

EOF

echo ""
echo "✅ Done! Photos have been linked to team members."
echo "Restart Strapi to see the changes: cd cfb-cms && npm run dev"
