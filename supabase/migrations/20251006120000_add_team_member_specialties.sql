-- Create junction table for team members and their treatment specialties
CREATE TABLE team_member_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_member_id, treatment_id)
);

-- Create index for faster lookups
CREATE INDEX idx_team_member_specialties_member ON team_member_specialties(team_member_id);
CREATE INDEX idx_team_member_specialties_treatment ON team_member_specialties(treatment_id);

-- Note: We keep the specialty field in team_member_translations for backwards compatibility
-- and for any additional specialty information not linked to treatments
