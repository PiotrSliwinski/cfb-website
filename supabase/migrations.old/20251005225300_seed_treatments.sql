-- Seed treatments data
INSERT INTO treatments (slug, is_published, display_order) VALUES
  ('implantes-dentarios', true, 1),
  ('aparelho-invisivel', true, 2),
  ('branqueamento', true, 3),
  ('ortodontia', true, 4),
  ('limpeza-dentaria', true, 5);

-- Get treatment ID for implantes
DO $$
DECLARE
  t_implantes UUID;
BEGIN
  SELECT id INTO t_implantes FROM treatments WHERE slug = 'implantes-dentarios';

  -- Implantes Dentários - Portuguese
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description) VALUES
  (t_implantes, 'pt',
   'Implantes Dentários',
   'Renove Seu Sorriso com Implantes Dentários',
   'Os implantes dentários são a solução moderna e permanente para substituir dentes perdidos. Na Clínica Ferreira Borges, utilizamos tecnologia de ponta para garantir resultados naturais e duradouros.');

  -- Implantes Dentários - English
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description) VALUES
  (t_implantes, 'en',
   'Dental Implants',
   'Renew Your Smile with Dental Implants',
   'Dental implants are the modern, permanent solution for replacing missing teeth. At Clínica Ferreira Borges, we use cutting-edge technology to ensure natural and long-lasting results.');
END $$;

-- Add testimonials
INSERT INTO testimonials (rating, is_published, display_order) VALUES
  (5, true, 1),
  (5, true, 2),
  (5, true, 3);

DO $$
DECLARE
  testimonial_ids UUID[];
BEGIN
  SELECT array_agg(id ORDER BY display_order) INTO testimonial_ids FROM testimonials;

  INSERT INTO testimonial_translations (testimonial_id, language_code, author_name, content) VALUES
  (testimonial_ids[1], 'pt', 'Maria Silva', 'Quem diria que você poderia realmente estar ansioso pela próxima visita ao dentista! A Dra. Filipa é uma ótima profissional e toda a equipa é muito atenciosa.'),
  (testimonial_ids[2], 'pt', 'João Santos', 'Dentista profissional e atencioso. Sempre me sinto bem cuidado e os resultados são excelentes. Recomendo vivamente!'),
  (testimonial_ids[3], 'pt', 'Ana Costa', 'Excelente clínica! Ambiente acolhedor e profissionais muito competentes. Os meus filhos adoram vir às consultas.');

  INSERT INTO testimonial_translations (testimonial_id, language_code, author_name, content) VALUES
  (testimonial_ids[1], 'en', 'Maria Silva', 'Who would have thought you could actually look forward to your next dentist visit! Dr. Filipa is a great professional and the whole team is very attentive.'),
  (testimonial_ids[2], 'en', 'João Santos', 'Professional and caring dentist. I always feel well taken care of and the results are excellent. Highly recommend!'),
  (testimonial_ids[3], 'en', 'Ana Costa', 'Excellent clinic! Welcoming environment and very competent professionals. My children love coming to appointments.');
END $$;
