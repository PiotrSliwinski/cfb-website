-- Complete treatment translations with benefits and process steps

-- Update Implantes Dentários with benefits and process steps
DO $$
DECLARE
  t_implantes UUID;
BEGIN
  SELECT id INTO t_implantes FROM treatments WHERE slug = 'implantes-dentarios';

  -- Update Portuguese translation with benefits and process steps
  UPDATE treatment_translations SET
    benefits = '[
      {"title": "Solução Permanente", "description": "Implantes duram a vida toda com os cuidados adequados"},
      {"title": "Aparência Natural", "description": "Impossível distinguir de dentes naturais"},
      {"title": "Conforto Total", "description": "Sensação natural ao mastigar e falar"},
      {"title": "Preserva Osso", "description": "Previne perda óssea facial"}
    ]'::jsonb,
    process_steps = '[
      {"step": 1, "title": "Consulta Inicial", "description": "Avaliação completa e plano de tratamento personalizado"},
      {"step": 2, "title": "Colocação do Implante", "description": "Cirurgia minimamente invasiva com anestesia local"},
      {"step": 3, "title": "Cicatrização", "description": "Período de 3-6 meses para integração óssea"},
      {"step": 4, "title": "Coroa Definitiva", "description": "Colocação da coroa personalizada"}
    ]'::jsonb
  WHERE treatment_id = t_implantes AND language_code = 'pt';

  -- Update English translation with benefits and process steps
  UPDATE treatment_translations SET
    benefits = '[
      {"title": "Permanent Solution", "description": "Implants last a lifetime with proper care"},
      {"title": "Natural Appearance", "description": "Indistinguishable from natural teeth"},
      {"title": "Total Comfort", "description": "Natural feeling when chewing and speaking"},
      {"title": "Preserves Bone", "description": "Prevents facial bone loss"}
    ]'::jsonb,
    process_steps = '[
      {"step": 1, "title": "Initial Consultation", "description": "Complete evaluation and personalized treatment plan"},
      {"step": 2, "title": "Implant Placement", "description": "Minimally invasive surgery with local anesthesia"},
      {"step": 3, "title": "Healing Period", "description": "3-6 months for bone integration"},
      {"step": 4, "title": "Final Crown", "description": "Placement of custom crown"}
    ]'::jsonb
  WHERE treatment_id = t_implantes AND language_code = 'en';
END $$;

-- Add Aparelho Invisível translations
DO $$
DECLARE
  t_invisivel UUID;
BEGIN
  SELECT id INTO t_invisivel FROM treatments WHERE slug = 'aparelho-invisivel';

  -- Portuguese
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_invisivel, 'pt',
   'Aparelho Invisível',
   'Alinhe Seus Dentes Discretamente',
   'O aparelho invisível é a solução moderna para alinhar os dentes sem brackets metálicos. Utilizamos alinhadores transparentes personalizados que são praticamente invisíveis e removíveis.',
   '[
     {"title": "Discreto", "description": "Praticamente invisível ao sorrir"},
     {"title": "Removível", "description": "Retire para comer e higienizar"},
     {"title": "Confortável", "description": "Sem fios ou brackets que causem irritação"},
     {"title": "Eficaz", "description": "Resultados previsíveis e comprovados"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Análise 3D", "description": "Scan digital dos seus dentes"},
     {"step": 2, "title": "Plano Virtual", "description": "Visualização do resultado final"},
     {"step": 3, "title": "Alinhadores Personalizados", "description": "Recebe conjunto de alinhadores feitos à medida"},
     {"step": 4, "title": "Acompanhamento", "description": "Consultas regulares para monitorizar progresso"}
   ]'::jsonb
  );

  -- English
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_invisivel, 'en',
   'Clear Aligners',
   'Straighten Your Teeth Discreetly',
   'Clear aligners are the modern solution for straightening teeth without metal brackets. We use custom transparent aligners that are virtually invisible and removable.',
   '[
     {"title": "Discreet", "description": "Virtually invisible when smiling"},
     {"title": "Removable", "description": "Take out for eating and cleaning"},
     {"title": "Comfortable", "description": "No wires or brackets causing irritation"},
     {"title": "Effective", "description": "Predictable and proven results"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "3D Analysis", "description": "Digital scan of your teeth"},
     {"step": 2, "title": "Virtual Plan", "description": "Preview of final result"},
     {"step": 3, "title": "Custom Aligners", "description": "Receive set of custom-made aligners"},
     {"step": 4, "title": "Follow-up", "description": "Regular appointments to monitor progress"}
   ]'::jsonb
  );
END $$;

-- Add Branqueamento translations
DO $$
DECLARE
  t_branqueamento UUID;
BEGIN
  SELECT id INTO t_branqueamento FROM treatments WHERE slug = 'branqueamento';

  -- Portuguese
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_branqueamento, 'pt',
   'Branqueamento Dentário',
   'Tenha Um Sorriso Mais Branco e Radiante',
   'O branqueamento dentário profissional é a forma mais segura e eficaz de clarear os dentes. Utilizamos técnicas avançadas para resultados visíveis e duradouros.',
   '[
     {"title": "Resultados Rápidos", "description": "Dentes até 8 tons mais brancos"},
     {"title": "Seguro", "description": "Procedimento supervisionado por profissionais"},
     {"title": "Duradouro", "description": "Efeito mantém-se por 1-3 anos"},
     {"title": "Sem Dor", "description": "Tratamento confortável e indolor"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Avaliação", "description": "Verificamos a saúde dos seus dentes"},
     {"step": 2, "title": "Limpeza Prévia", "description": "Remoção de tártaro e manchas superficiais"},
     {"step": 3, "title": "Aplicação do Gel", "description": "Gel branqueador profissional aplicado"},
     {"step": 4, "title": "Ativação", "description": "Luz LED ou laser para potencializar resultado"}
   ]'::jsonb
  );

  -- English
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_branqueamento, 'en',
   'Teeth Whitening',
   'Get A Brighter, Whiter Smile',
   'Professional teeth whitening is the safest and most effective way to brighten your teeth. We use advanced techniques for visible, long-lasting results.',
   '[
     {"title": "Fast Results", "description": "Teeth up to 8 shades whiter"},
     {"title": "Safe", "description": "Procedure supervised by professionals"},
     {"title": "Long-lasting", "description": "Effect lasts 1-3 years"},
     {"title": "Pain-free", "description": "Comfortable and painless treatment"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Assessment", "description": "We check your dental health"},
     {"step": 2, "title": "Pre-cleaning", "description": "Removal of tartar and surface stains"},
     {"step": 3, "title": "Gel Application", "description": "Professional whitening gel applied"},
     {"step": 4, "title": "Activation", "description": "LED light or laser to enhance results"}
   ]'::jsonb
  );
END $$;

-- Add Ortodontia translations
DO $$
DECLARE
  t_ortodontia UUID;
BEGIN
  SELECT id INTO t_ortodontia FROM treatments WHERE slug = 'ortodontia';

  -- Portuguese
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_ortodontia, 'pt',
   'Ortodontia',
   'Correção e Alinhamento Dentário',
   'A ortodontia corrige o posicionamento dos dentes e maxilares para melhorar função e estética. Oferecemos aparelhos fixos e móveis para todas as idades.',
   '[
     {"title": "Melhora a Mordida", "description": "Corrige problemas funcionais"},
     {"title": "Previne Problemas", "description": "Evita desgaste e doenças gengivais"},
     {"title": "Estética", "description": "Sorriso harmonioso e bonito"},
     {"title": "Todas as Idades", "description": "Tratamento para crianças e adultos"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Diagnóstico", "description": "Radiografias e moldagens dos dentes"},
     {"step": 2, "title": "Plano de Tratamento", "description": "Definição da melhor abordagem"},
     {"step": 3, "title": "Colocação do Aparelho", "description": "Instalação do aparelho ortodôntico"},
     {"step": 4, "title": "Manutenções", "description": "Ajustes mensais para movimentação gradual"}
   ]'::jsonb
  );

  -- English
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_ortodontia, 'en',
   'Orthodontics',
   'Dental Correction and Alignment',
   'Orthodontics corrects the position of teeth and jaws to improve function and aesthetics. We offer fixed and removable braces for all ages.',
   '[
     {"title": "Improves Bite", "description": "Corrects functional problems"},
     {"title": "Prevents Issues", "description": "Avoids wear and gum disease"},
     {"title": "Aesthetics", "description": "Harmonious and beautiful smile"},
     {"title": "All Ages", "description": "Treatment for children and adults"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Diagnosis", "description": "X-rays and dental impressions"},
     {"step": 2, "title": "Treatment Plan", "description": "Define best approach"},
     {"step": 3, "title": "Braces Placement", "description": "Installation of orthodontic appliance"},
     {"step": 4, "title": "Maintenance", "description": "Monthly adjustments for gradual movement"}
   ]'::jsonb
  );
END $$;

-- Add Limpeza Dentária translations
DO $$
DECLARE
  t_limpeza UUID;
BEGIN
  SELECT id INTO t_limpeza FROM treatments WHERE slug = 'limpeza-dentaria';

  -- Portuguese
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_limpeza, 'pt',
   'Limpeza Dentária',
   'Mantenha Seus Dentes Saudáveis',
   'A limpeza dentária profissional remove placa bacteriana e tártaro que a escovação normal não consegue eliminar. Essencial para prevenir cáries e doenças gengivais.',
   '[
     {"title": "Previne Cáries", "description": "Remove bactérias causadoras de cáries"},
     {"title": "Gengivas Saudáveis", "description": "Previne gengivite e periodontite"},
     {"title": "Hálito Fresco", "description": "Elimina mau hálito"},
     {"title": "Dentes Mais Brancos", "description": "Remove manchas superficiais"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Avaliação", "description": "Exame das gengivas e dentes"},
     {"step": 2, "title": "Remoção de Tártaro", "description": "Ultrassom remove tártaro endurecido"},
     {"step": 3, "title": "Polimento", "description": "Pasta especial deixa dentes lisos e brilhantes"},
     {"step": 4, "title": "Aplicação de Flúor", "description": "Fortalecimento do esmalte dentário"}
   ]'::jsonb
  );

  -- English
  INSERT INTO treatment_translations (treatment_id, language_code, title, subtitle, description, benefits, process_steps) VALUES
  (t_limpeza, 'en',
   'Dental Cleaning',
   'Keep Your Teeth Healthy',
   'Professional dental cleaning removes plaque and tartar that normal brushing cannot eliminate. Essential for preventing cavities and gum disease.',
   '[
     {"title": "Prevents Cavities", "description": "Removes cavity-causing bacteria"},
     {"title": "Healthy Gums", "description": "Prevents gingivitis and periodontitis"},
     {"title": "Fresh Breath", "description": "Eliminates bad breath"},
     {"title": "Whiter Teeth", "description": "Removes surface stains"}
   ]'::jsonb,
   '[
     {"step": 1, "title": "Assessment", "description": "Examination of gums and teeth"},
     {"step": 2, "title": "Tartar Removal", "description": "Ultrasound removes hardened tartar"},
     {"step": 3, "title": "Polishing", "description": "Special paste leaves teeth smooth and shiny"},
     {"step": 4, "title": "Fluoride Application", "description": "Strengthens tooth enamel"}
   ]'::jsonb
  );
END $$;
