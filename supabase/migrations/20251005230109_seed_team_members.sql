-- Seed team members
INSERT INTO team_members (slug, photo_url, display_order, email, phone, is_published) VALUES
  ('carlos-sousa', '/images/team/carlos.png', 1, NULL, NULL, true),
  ('anna-carolina-ribeiro', '/images/team/anna.png', 2, NULL, NULL, true),
  ('filipa-caeiro', '/images/team/filipa-caeiro.png', 3, NULL, NULL, true),
  ('filipa-marques', '/images/team/filipa-marques.png', 4, NULL, NULL, true),
  ('ronite-harjivan', '/images/team/ronite.png', 5, NULL, NULL, true),
  ('tomas-godinho', '/images/team/tomas.png', 6, NULL, NULL, true),
  ('filipa-cunha', '/images/team/filipa-cunha.png', 7, NULL, NULL, true),
  ('samira-soares', '/images/team/samira.png', 8, NULL, NULL, true),
  ('angela-lino', '/images/team/angela.png', 9, NULL, NULL, true);

-- Add Portuguese translations
DO $$
DECLARE
  team_ids UUID[];
BEGIN
  SELECT array_agg(id ORDER BY display_order) INTO team_ids FROM team_members;

  -- Portuguese translations
  INSERT INTO team_member_translations (member_id, language_code, name, title, specialty, credentials) VALUES
  (team_ids[1], 'pt', 'Dr. Carlos Sousa', 'Diretor Clínico', 'Ortodontia, Aparelho Invisível, Medicina Dentária do Sono, Dor Orofacial', 'OMD 5578'),
  (team_ids[2], 'pt', 'Dra. Anna Carolina Ribeiro', 'Médica Dentista', 'Ortodontia, Aparelho Invisível, Dentisteria', 'OMD 10815'),
  (team_ids[3], 'pt', 'Dra. Filipa Caeiro', 'Médica Dentista', 'Implantes Dentários, Cirurgia Oral, Reabilitação Oral', 'OMD 7931'),
  (team_ids[4], 'pt', 'Dra. Filipa Marques', 'Médica Dentista', 'Odontopediatria', 'OMD 5579'),
  (team_ids[5], 'pt', 'Dr. Ronite Harjivan', 'Médico Dentista', 'Implantes Dentários, Cirurgia Oral', 'OMD 8713'),
  (team_ids[6], 'pt', 'Tomás Godinho', 'Higienista Oral', 'Limpeza Dentária', 'APHO C-076448088'),
  (team_ids[7], 'pt', 'Filipa Cunha', 'Higienista Oral', 'Limpeza Dentária', 'APHO C-034759085'),
  (team_ids[8], 'pt', 'Samira Soares', 'Assistente Dentária', 'Assistência Clínica', NULL),
  (team_ids[9], 'pt', 'Ângela Lino', 'Assistente Dentária', 'Assistência Clínica', NULL);

  -- English translations
  INSERT INTO team_member_translations (member_id, language_code, name, title, specialty, credentials) VALUES
  (team_ids[1], 'en', 'Dr. Carlos Sousa', 'Clinical Director', 'Orthodontics, Clear Aligners, Sleep Dentistry, Orofacial Pain', 'OMD 5578'),
  (team_ids[2], 'en', 'Dr. Anna Carolina Ribeiro', 'Dentist', 'Orthodontics, Clear Aligners, Cosmetic Dentistry', 'OMD 10815'),
  (team_ids[3], 'en', 'Dr. Filipa Caeiro', 'Dentist', 'Dental Implants, Oral Surgery, Oral Rehabilitation', 'OMD 7931'),
  (team_ids[4], 'en', 'Dr. Filipa Marques', 'Dentist', 'Pediatric Dentistry', 'OMD 5579'),
  (team_ids[5], 'en', 'Dr. Ronite Harjivan', 'Dentist', 'Dental Implants, Oral Surgery', 'OMD 8713'),
  (team_ids[6], 'en', 'Tomás Godinho', 'Oral Hygienist', 'Dental Cleaning', 'APHO C-076448088'),
  (team_ids[7], 'en', 'Filipa Cunha', 'Oral Hygienist', 'Dental Cleaning', 'APHO C-034759085'),
  (team_ids[8], 'en', 'Samira Soares', 'Dental Assistant', 'Clinical Assistance', NULL),
  (team_ids[9], 'en', 'Ângela Lino', 'Dental Assistant', 'Clinical Assistance', NULL);

END $$;
