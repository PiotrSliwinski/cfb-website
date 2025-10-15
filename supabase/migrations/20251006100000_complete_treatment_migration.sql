-- Complete Treatment Migration
-- This migration adds all 11 missing treatments with full PT/EN translations
-- and updates existing 5 treatments with proper image URLs

-- First, update existing treatments with proper image URLs
UPDATE treatments SET
  hero_image_url = '/images/treatments/heroes/implantes-dentarios.jpg',
  icon_url = '/images/treatments/icons/implantes-dentarios.svg'
WHERE slug = 'implantes-dentarios';

UPDATE treatments SET
  hero_image_url = '/images/treatments/heroes/aparelho-invisivel.jpg',
  icon_url = '/images/treatments/icons/aparelho-invisivel.svg'
WHERE slug = 'aparelho-invisivel';

UPDATE treatments SET
  hero_image_url = '/images/treatments/heroes/branqueamento.jpg',
  icon_url = NULL
WHERE slug = 'branqueamento';

UPDATE treatments SET
  hero_image_url = '/images/treatments/heroes/ortodontia.jpg',
  icon_url = '/images/treatments/icons/ortodontia.svg'
WHERE slug = 'ortodontia';

UPDATE treatments SET
  hero_image_url = '/images/treatments/heroes/limpeza-dentaria.jpg',
  icon_url = '/images/treatments/icons/limpeza-dentaria.svg'
WHERE slug = 'limpeza-dentaria';

-- Add missing treatments
DO $$
DECLARE
  t_periodontologia UUID;
  t_consulta UUID;
  t_reabilitacao UUID;
  t_dor_orofacial UUID;
  t_cirurgia_oral UUID;
  t_endodontia UUID;
  t_medicina_sono UUID;
  t_restauracao_estetica UUID;
  t_dentisteria UUID;
  t_odontopediatria UUID;
BEGIN

-- 1. Periodontologia / Periodontology
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('periodontologia', true, false, 6, '/images/treatments/heroes/periodontologia.jpg', '/images/treatments/icons/periodontologia.svg')
RETURNING id INTO t_periodontologia;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_periodontologia, 'pt', 'Periodontologia',
   'Descubra o Poder da Periodontologia para um Sorriso Saudável',
   'A periodontologia é a especialidade da medicina dentária que lhe abre as portas para um sorriso mais saudável e radiante. Focada na prevenção, diagnóstico e tratamento de doenças gengivais.',
   '["Saúde Gengival Melhorada", "Prevenção da Perda Dentária", "Redução de Riscos de Doenças Sistémicas", "Melhoria do Hálito"]'::jsonb,
   '[]'::jsonb),
  (t_periodontologia, 'en', 'Periodontology',
   'Discover the Power of Periodontology for a Healthy Smile',
   'Periodontology is a dental specialty focused on studying, preventing, and treating gingival and periodontal diseases affecting tooth-supporting tissues. The clinic offers personalized treatment plans using advanced technologies.',
   '["Improved Gum Health", "Tooth Loss Prevention", "Systemic Disease Risk Reduction", "Breath Improvement"]'::jsonb,
   '[]'::jsonb);

-- 2. Consulta Dentária / Dental Consultation
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('consulta-dentaria', true, false, 7, '/images/treatments/heroes/consulta-dentaria.jpg', NULL)
RETURNING id INTO t_consulta;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_consulta, 'pt', 'Consulta Dentária',
   'Cuidado e Prevenção Começam na Consulta Dentária',
   'Na Clínica Ferreira Borges, somos o seu parceiro ideal para uma saúde oral exemplar. Nas nossas consultas dentárias, oferecemos um serviço personalizado, focado na prevenção, diagnóstico e tratamento de condições orais.',
   '["Deteção Precoce de Patologias Orais", "Plano de Tratamento Personalizado", "Educação para a Saúde Oral", "Prevenção de Doenças"]'::jsonb,
   '[]'::jsonb),
  (t_consulta, 'en', 'Dental Consultation',
   'Care and Prevention Start at the Dental Visit',
   'Clínica Ferreira Borges is your ideal partner for exemplary oral health. In our dental appointments, we offer a personalized service, focused on the prevention, diagnosis and treatment of oral conditions.',
   '["Early Diagnosis of Oral Pathologies", "Personalized Treatment Plan", "Oral Health Education", "Prevention of Dental Diseases"]'::jsonb,
   '[]'::jsonb);

-- 3. Reabilitação Oral / Prosthodontics
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('reabilitacao-oral', true, false, 8, '/images/treatments/heroes/reabilitacao-oral.jpg', NULL)
RETURNING id INTO t_reabilitacao;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_reabilitacao, 'pt', 'Reabilitação Oral',
   'Reabilitação Oral: O Caminho para um Sorriso Completo e Saudável',
   'A reabilitação oral é focada na restauração da funcionalidade e estética da boca, tratando uma variedade de condições complexas. Utilizamos materiais de alta qualidade e planos de tratamento meticulosamente desenhados.',
   '["Restauração da Função Mastigatória", "Melhoria da Estética Facial", "Resolução de Múltiplos Problemas Dentários", "Aumento da Longevidade dos Dentes"]'::jsonb,
   '[]'::jsonb),
  (t_reabilitacao, 'en', 'Prosthodontics',
   'Prosthodontics: The Path to a Complete and Healthy Smile',
   'Prosthodontics is a transformative dental specialty focused on recovering function, aesthetics, and oral health through customized rehabilitation solutions. The clinic aims to restore not just smiles, but confidence and well-being.',
   '["Restoration of Chewing Function", "Improving Facial Aesthetics", "Solution for Multiple Dental Problems", "Increased Teeth Longevity"]'::jsonb,
   '[]'::jsonb);

-- 4. Dor Orofacial / Orofacial Pain
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('dor-orofacial', true, false, 9, '/images/treatments/heroes/dor-orofacial.jpg', NULL)
RETURNING id INTO t_dor_orofacial;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_dor_orofacial, 'pt', 'Dor Orofacial',
   'Alívio e Esperança: A Jornada para Superar a Dor Orofacial',
   'A dor orofacial é uma condição complexa que afeta a qualidade de vida, manifestando-se através de sintomas como dores de cabeça, desconforto na mandíbula, dor cervical e zumbido nos ouvidos.',
   '["Alívio Eficaz da Dor", "Abordagem Multidisciplinar", "Melhoria da Função Oral", "Prevenção de Recorrências"]'::jsonb,
   '[]'::jsonb),
  (t_dor_orofacial, 'en', 'Orofacial Pain',
   'Relief and Hope: The Journey to Overcoming Orofacial Pain',
   'Orofacial pain is a complex condition affecting quality of life, manifesting through symptoms like headaches, jaw discomfort, neck pain, and ear ringing. Clínica Ferreira Borges offers a specialized, compassionate approach.',
   '["Effective Pain Relief", "Multidisciplinary Approach", "Improving Oral Function", "Relapse Prevention"]'::jsonb,
   '[]'::jsonb);

-- 5. Cirurgia Oral / Oral Surgery
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('cirurgia-oral', true, false, 10, '/images/treatments/heroes/cirurgia-oral.jpg', NULL)
RETURNING id INTO t_cirurgia_oral;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_cirurgia_oral, 'pt', 'Cirurgia Oral',
   'Expertise e Cuidado em Cirurgia Oral',
   'A cirurgia oral engloba uma variedade de procedimentos destinados a tratar doenças, lesões e defeitos na região oral e maxilofacial. Na nossa clínica, cada jornada de cirurgia oral começa com uma compreensão profunda das suas necessidades únicas.',
   '["Resolução de Patologias Complexas", "Melhoria na Funcionalidade Oral", "Recuperação Estética", "Prevenção de Futuros Problemas Dentários"]'::jsonb,
   '[]'::jsonb),
  (t_cirurgia_oral, 'en', 'Oral Surgery',
   'Expertise and Care in Oral Surgery',
   'Oral surgery is a medical procedure that serves as a gateway to self-confidence and a radiant smile. The clinic offers personalized solutions using cutting-edge technology, focusing on patient-specific treatment plans.',
   '["Resolution of Complex Pathologies", "Improved Oral Functionality", "Aesthetic Recovery", "Preventing Future Dental Problems"]'::jsonb,
   '[]'::jsonb);

-- 6. Endodontia / Endodontics
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('endodontia', true, false, 11, '/images/treatments/heroes/endodontia.jpg', NULL)
RETURNING id INTO t_endodontia;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_endodontia, 'pt', 'Endodontia',
   'Preserve o Seu Dente com Endodontia Avançada',
   'A endodontia é a especialidade da medicina dentária que trata doenças da polpa dentária. Quando a polpa dentária é afetada por cáries profundas, traumatismos ou lesões, a desvitalização torna-se essencial.',
   '["Preservação do Dente Natural", "Alívio Imediato da Dor", "Prevenção de Futuras Infeções", "Melhoria da Saúde Oral Geral"]'::jsonb,
   '[]'::jsonb),
  (t_endodontia, 'en', 'Endodontics',
   'Preserve Your Tooth with Advanced Endodontics',
   'Endodontics is a dental specialty treating diseases of the dental pulp. When dental pulp is affected by deep cavities, trauma, or injury, devitalization becomes essential. The goal is to preserve the natural tooth structure.',
   '["Natural Tooth Preservation", "Immediate Pain Relief", "Preventing Future Infections", "Improved Overall Oral Health"]'::jsonb,
   '[]'::jsonb);

-- 7. Medicina Dentária do Sono / Sleep Apnea
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('medicina-dentaria-do-sono', true, false, 12, '/images/treatments/heroes/medicina-dentaria-do-sono.jpg', '/images/treatments/icons/medicina-dentaria-do-sono.svg')
RETURNING id INTO t_medicina_sono;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_medicina_sono, 'pt', 'Medicina Dentária do Sono',
   'Descanse Melhor com a Medicina Dentária do Sono',
   'A medicina dentária do sono é um campo revolucionário focado no combate aos distúrbios do sono, particularmente a apneia do sono. Utiliza dispositivos orais personalizados para manter as vias aéreas abertas durante o sono.',
   '["Melhoria da Qualidade do Sono", "Redução de Riscos de Saúde", "Aumento de Energia e Concentração", "Soluções Personalizadas"]'::jsonb,
   '[]'::jsonb),
  (t_medicina_sono, 'en', 'Sleep Dentistry',
   'Rest Better with Dental Sleep Medicine',
   'Dental Sleep Medicine is a revolutionary field focused on combating sleep disorders, particularly sleep apnea. It offers personalized treatments using specialized oral devices to keep airways open.',
   '["Aesthetic Appeal", "Reducing the Risk of Health Problems", "Increased Energy and Concentration", "Personalized Solutions"]'::jsonb,
   '[]'::jsonb);

-- Add FAQs for Sleep Apnea
DECLARE
  faq_ids UUID[];
BEGIN
  INSERT INTO treatment_faqs (treatment_id, display_order) VALUES
    (t_medicina_sono, 1), (t_medicina_sono, 2), (t_medicina_sono, 3), (t_medicina_sono, 4), (t_medicina_sono, 5);

  SELECT array_agg(id ORDER BY display_order) INTO faq_ids
  FROM treatment_faqs WHERE treatment_id = t_medicina_sono;

  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'pt', 'O que é a apneia do sono?', 'A apneia do sono é caracterizada por interrupções respiratórias durante o sono. Pode levar a complicações graves se não for tratada. Os sintomas incluem ronco alto, fadiga diurna e dores de cabeça matinais.'),
    (faq_ids[1], 'en', 'What is sleep apnea?', 'Sleep apnea is characterized by breathing interruptions during sleep. It can lead to serious health complications if untreated. Symptoms include loud snoring, daytime fatigue, and morning headaches.'),
    (faq_ids[2], 'pt', 'Como é tratada a apneia do sono?', 'O tratamento varia desde mudanças no estilo de vida até dispositivos CPAP e aparelhos orais. Cada indivíduo é único e o tratamento da apneia do sono requer uma abordagem personalizada.'),
    (faq_ids[2], 'en', 'How is sleep apnea treated?', 'Treatment varies from lifestyle changes to CPAP devices and oral appliances. Each individual is unique, and treating sleep apnea requires a personalized approach.'),
    (faq_ids[3], 'pt', 'O que é apneia obstrutiva do sono?', 'A apneia obstrutiva do sono ocorre quando as vias aéreas ficam bloqueadas durante o sono.'),
    (faq_ids[3], 'en', 'What is obstructive sleep apnea?', 'Obstructive sleep apnea occurs when the airway is blocked during sleep.'),
    (faq_ids[4], 'pt', 'A apneia do sono pode ser fatal?', 'Embora raramente seja diretamente fatal, pode aumentar o risco de eventos graves de saúde.'),
    (faq_ids[4], 'en', 'Can sleep apnea be fatal?', 'While rarely directly fatal, it can increase risk of serious health events.'),
    (faq_ids[5], 'pt', 'Como é diagnosticada a apneia do sono?', 'O diagnóstico tipicamente envolve avaliação clínica e polissonografia.'),
    (faq_ids[5], 'en', 'How is sleep apnea diagnosed?', 'Diagnosis typically involves clinical evaluation and polysomnography.');
END;

-- 8. Restauração Estética / Aesthetic Restorations (Cosmetic Dentistry)
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('restauracao-estetica', true, false, 13, '/images/treatments/heroes/restauracao-estetica.jpg', '/images/treatments/icons/restauracao-estetica.svg')
RETURNING id INTO t_restauracao_estetica;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_restauracao_estetica, 'pt', 'Restauração Estética',
   'Revele a Beleza do Seu Sorriso com Restauração Estética',
   'A restauração estética combina arte e ciência para restaurar a harmonia natural do sorriso. Utilizamos materiais de alta qualidade e técnicas avançadas para entregar resultados duradouros e radiantes.',
   '["Melhoria Imediata da Aparência", "Procedimentos Minimamente Invasivos", "Resultados Duradouros", "Tratamento Totalmente Personalizado"]'::jsonb,
   '[]'::jsonb),
  (t_restauracao_estetica, 'en', 'Cosmetic Dentistry',
   'Reveal the Beauty of Your Smile with Cosmetic Dentistry',
   'Cosmetic Dentistry is a transformative approach that corrects dental imperfections. The goal is to enhance smile aesthetics while boosting self-esteem using advanced technologies and personalized treatments.',
   '["Immediate Appearance Improvement", "Minimally Invasive Procedures", "Lasting Results", "Full Customization"]'::jsonb,
   '[]'::jsonb);

-- 9. Dentisteria / Dental Restoration
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('dentisteria', true, false, 14, '/images/treatments/heroes/dentisteria.jpg', '/images/treatments/icons/dentisteria.svg')
RETURNING id INTO t_dentisteria;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_dentisteria, 'pt', 'Dentisteria',
   'Restaure Seu Sorriso com a Arte da Dentisteria',
   'A dentisteria é uma especialidade focada na restauração estética e funcional dos dentes, utilizando técnicas avançadas e materiais de alta qualidade para criar resultados naturais.',
   '["Restauração Estética", "Prevenção de Danos", "Melhoria da Função Dentária", "Aumento da Confiança"]'::jsonb,
   '[]'::jsonb),
  (t_dentisteria, 'en', 'Dental Restoration',
   'Restore Your Smile with the Art of Dental Restoration',
   'Dental restoration is a specialty focused on aesthetic and functional tooth restoration, using advanced techniques and high-quality materials to create natural-looking results.',
   '["Aesthetic Restoration", "Damage Prevention", "Improved Dental Function", "Confidence Boost"]'::jsonb,
   '[]'::jsonb);

-- 10. Odontopediatria / Pediatric Dentistry
INSERT INTO treatments (slug, is_published, is_featured, display_order, hero_image_url, icon_url)
VALUES ('odontopediatria', true, false, 15, '/images/treatments/heroes/odontopediatria.jpg', NULL)
RETURNING id INTO t_odontopediatria;

INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps)
VALUES
  (t_odontopediatria, 'pt', 'Odontopediatria',
   'Sorrisos Felizes Desde a Infância com Odontopediatria',
   'A odontopediatria é uma especialidade dentária focada na saúde oral das crianças desde o nascimento até à adolescência. Criamos experiências dentárias positivas para crianças.',
   '["Promoção de Hábitos Saudáveis", "Deteção Precoce de Patologias Dentárias", "Tratamentos Personalizados para Crianças", "Construção de Relação Positiva com a Medicina Dentária"]'::jsonb,
   '[]'::jsonb),
  (t_odontopediatria, 'en', 'Pediatric Dentistry',
   'Happy Smiles From Childhood with Pediatric Dentistry',
   'Pediatric Dentistry is a dental specialty focused on children''s oral health from birth to adolescence. The clinic provides a gentle, personalized approach to ensure positive dental experiences.',
   '["Promoting Healthy Habits", "Early Detection of Dental Pathologies", "Personalized Treatments for Children", "Building a Positive Relationship with Dentistry"]'::jsonb,
   '[]'::jsonb);

END $$;
