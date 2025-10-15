-- Seed Treatment FAQs

-- Implantes Dentários FAQs
DO $$
DECLARE
  t_implantes UUID;
  faq_ids UUID[];
BEGIN
  SELECT id INTO t_implantes FROM treatments WHERE slug = 'implantes-dentarios';

  -- Create FAQs
  INSERT INTO treatment_faqs (treatment_id, display_order) VALUES
    (t_implantes, 1),
    (t_implantes, 2),
    (t_implantes, 3),
    (t_implantes, 4);

  -- Get FAQ IDs in order
  SELECT array_agg(id ORDER BY display_order) INTO faq_ids
  FROM treatment_faqs
  WHERE treatment_id = t_implantes;

  -- Portuguese translations
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'pt', 'Quanto tempo duram os implantes dentários?', 'Com os cuidados adequados e higiene oral regular, os implantes dentários podem durar toda a vida. A taxa de sucesso após 10 anos é superior a 95%.'),
    (faq_ids[2], 'pt', 'O procedimento é doloroso?', 'O procedimento é realizado com anestesia local, por isso não sentirá dor durante a cirurgia. Após o efeito da anestesia, pode haver algum desconforto que é facilmente controlado com medicação.'),
    (faq_ids[3], 'pt', 'Quanto tempo demora o tratamento completo?', 'O tratamento completo geralmente leva entre 3 a 6 meses, incluindo o período de cicatrização. Em alguns casos, pode ser possível fazer carga imediata.'),
    (faq_ids[4], 'pt', 'Qualquer pessoa pode fazer implantes?', 'A maioria das pessoas pode fazer implantes dentários. No entanto, é necessário ter osso suficiente e boa saúde geral. Avaliamos cada caso individualmente na consulta inicial.');

  -- English translations
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'en', 'How long do dental implants last?', 'With proper care and regular oral hygiene, dental implants can last a lifetime. The success rate after 10 years is over 95%.'),
    (faq_ids[2], 'en', 'Is the procedure painful?', 'The procedure is performed under local anesthesia, so you will not feel pain during surgery. After the anesthesia wears off, there may be some discomfort that is easily controlled with medication.'),
    (faq_ids[3], 'en', 'How long does the complete treatment take?', 'The complete treatment usually takes between 3 to 6 months, including the healing period. In some cases, immediate loading may be possible.'),
    (faq_ids[4], 'en', 'Can anyone get implants?', 'Most people can get dental implants. However, sufficient bone and good overall health are necessary. We evaluate each case individually in the initial consultation.');
END $$;

-- Aparelho Invisível FAQs
DO $$
DECLARE
  t_invisivel UUID;
  faq_ids UUID[];
BEGIN
  SELECT id INTO t_invisivel FROM treatments WHERE slug = 'aparelho-invisivel';

  INSERT INTO treatment_faqs (treatment_id, display_order) VALUES
    (t_invisivel, 1),
    (t_invisivel, 2),
    (t_invisivel, 3),
    (t_invisivel, 4);

  SELECT array_agg(id ORDER BY display_order) INTO faq_ids
  FROM treatment_faqs
  WHERE treatment_id = t_invisivel;

  -- Portuguese
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'pt', 'Quanto tempo tenho que usar os alinhadores?', 'Os alinhadores devem ser usados 22 horas por dia, removendo apenas para comer e escovar os dentes. O tratamento completo varia entre 6 a 18 meses.'),
    (faq_ids[2], 'pt', 'É realmente invisível?', 'Os alinhadores são feitos de material transparente e são praticamente invisíveis. A maioria das pessoas não perceberá que está a usar aparelho.'),
    (faq_ids[3], 'pt', 'Posso comer com o alinhador?', 'Não, deve remover os alinhadores para comer e beber qualquer coisa além de água. Isto previne manchas e danos aos alinhadores.'),
    (faq_ids[4], 'pt', 'Com que frequência preciso trocar os alinhadores?', 'Geralmente troca-se de alinhador a cada 1-2 semanas, conforme o plano de tratamento. Terá consultas de acompanhamento a cada 6-8 semanas.');

  -- English
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'en', 'How long do I have to wear the aligners?', 'Aligners should be worn 22 hours a day, removing only to eat and brush teeth. Complete treatment ranges from 6 to 18 months.'),
    (faq_ids[2], 'en', 'Is it really invisible?', 'Aligners are made of transparent material and are virtually invisible. Most people will not notice you are wearing braces.'),
    (faq_ids[3], 'en', 'Can I eat with the aligner?', 'No, you should remove aligners to eat and drink anything other than water. This prevents staining and damage to aligners.'),
    (faq_ids[4], 'en', 'How often do I need to change aligners?', 'Generally aligners are changed every 1-2 weeks, according to the treatment plan. You will have follow-up appointments every 6-8 weeks.');
END $$;

-- Branqueamento FAQs
DO $$
DECLARE
  t_branqueamento UUID;
  faq_ids UUID[];
BEGIN
  SELECT id INTO t_branqueamento FROM treatments WHERE slug = 'branqueamento';

  INSERT INTO treatment_faqs (treatment_id, display_order) VALUES
    (t_branqueamento, 1),
    (t_branqueamento, 2),
    (t_branqueamento, 3),
    (t_branqueamento, 4);

  SELECT array_agg(id ORDER BY display_order) INTO faq_ids
  FROM treatment_faqs
  WHERE treatment_id = t_branqueamento;

  -- Portuguese
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'pt', 'O branqueamento danifica os dentes?', 'Não, quando realizado por profissionais com produtos adequados, o branqueamento é completamente seguro e não danifica o esmalte dos dentes.'),
    (faq_ids[2], 'pt', 'Quanto tempo dura o resultado?', 'Os resultados podem durar de 1 a 3 anos, dependendo dos hábitos alimentares e de higiene. Evitar café, vinho tinto e tabaco ajuda a prolongar o efeito.'),
    (faq_ids[3], 'pt', 'Vou ter sensibilidade dentária?', 'Alguns pacientes podem sentir sensibilidade temporária durante ou após o tratamento. Esta sensibilidade é normal e desaparece em poucos dias.'),
    (faq_ids[4], 'pt', 'Quantas sessões são necessárias?', 'Na maioria dos casos, uma única sessão de branqueamento em consultório é suficiente. Para casos mais complexos, podem ser necessárias 2-3 sessões.');

  -- English
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'en', 'Does whitening damage teeth?', 'No, when performed by professionals with appropriate products, whitening is completely safe and does not damage tooth enamel.'),
    (faq_ids[2], 'en', 'How long do results last?', 'Results can last from 1 to 3 years, depending on dietary and hygiene habits. Avoiding coffee, red wine and tobacco helps prolong the effect.'),
    (faq_ids[3], 'en', 'Will I have tooth sensitivity?', 'Some patients may experience temporary sensitivity during or after treatment. This sensitivity is normal and disappears within a few days.'),
    (faq_ids[4], 'en', 'How many sessions are needed?', 'In most cases, a single in-office whitening session is sufficient. For more complex cases, 2-3 sessions may be necessary.');
END $$;

-- Ortodontia FAQs
DO $$
DECLARE
  t_ortodontia UUID;
  faq_ids UUID[];
BEGIN
  SELECT id INTO t_ortodontia FROM treatments WHERE slug = 'ortodontia';

  INSERT INTO treatment_faqs (treatment_id, display_order) VALUES
    (t_ortodontia, 1),
    (t_ortodontia, 2),
    (t_ortodontia, 3),
    (t_ortodontia, 4);

  SELECT array_agg(id ORDER BY display_order) INTO faq_ids
  FROM treatment_faqs
  WHERE treatment_id = t_ortodontia;

  -- Portuguese
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'pt', 'Qual a idade ideal para ortodontia?', 'Não há idade limite para ortodontia. Crianças podem começar por volta dos 7 anos, mas adultos de qualquer idade também podem fazer tratamento ortodôntico.'),
    (faq_ids[2], 'pt', 'Quanto tempo dura o tratamento?', 'O tratamento ortodôntico geralmente dura entre 12 a 24 meses, dependendo da complexidade do caso. Casos mais simples podem ser resolvidos em 6-12 meses.'),
    (faq_ids[3], 'pt', 'O aparelho dói?', 'Pode haver algum desconforto nos primeiros dias após a colocação e após os ajustes mensais, mas não é uma dor intensa. A maioria dos pacientes adapta-se rapidamente.'),
    (faq_ids[4], 'pt', 'Preciso usar contenção após o tratamento?', 'Sim, após remover o aparelho é essencial usar contenção para manter os dentes na nova posição. Inicialmente usa-se 24h/dia, depois apenas à noite.');

  -- English
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'en', 'What is the ideal age for orthodontics?', 'There is no age limit for orthodontics. Children can start around age 7, but adults of any age can also undergo orthodontic treatment.'),
    (faq_ids[2], 'en', 'How long does treatment last?', 'Orthodontic treatment generally lasts between 12 to 24 months, depending on case complexity. Simpler cases can be resolved in 6-12 months.'),
    (faq_ids[3], 'en', 'Do braces hurt?', 'There may be some discomfort in the first days after placement and after monthly adjustments, but it is not intense pain. Most patients adapt quickly.'),
    (faq_ids[4], 'en', 'Do I need to wear retainers after treatment?', 'Yes, after removing braces it is essential to wear retainers to maintain teeth in their new position. Initially worn 24h/day, then only at night.');
END $$;

-- Limpeza Dentária FAQs
DO $$
DECLARE
  t_limpeza UUID;
  faq_ids UUID[];
BEGIN
  SELECT id INTO t_limpeza FROM treatments WHERE slug = 'limpeza-dentaria';

  INSERT INTO treatment_faqs (treatment_id, display_order) VALUES
    (t_limpeza, 1),
    (t_limpeza, 2),
    (t_limpeza, 3),
    (t_limpeza, 4);

  SELECT array_agg(id ORDER BY display_order) INTO faq_ids
  FROM treatment_faqs
  WHERE treatment_id = t_limpeza;

  -- Portuguese
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'pt', 'Com que frequência devo fazer limpeza?', 'Recomenda-se fazer limpeza dentária profissional a cada 6 meses. Pacientes com maior propensão a tártaro podem precisar de limpezas mais frequentes.'),
    (faq_ids[2], 'pt', 'A limpeza remove o esmalte dos dentes?', 'Não, a limpeza profissional remove apenas placa bacteriana, tártaro e manchas superficiais. O esmalte dentário não é danificado pelo procedimento.'),
    (faq_ids[3], 'pt', 'Vou sentir dor durante a limpeza?', 'O procedimento geralmente não causa dor. Pacientes com gengivas sensíveis ou inflamadas podem sentir algum desconforto, mas é bem tolerável.'),
    (faq_ids[4], 'pt', 'Quanto tempo demora a limpeza?', 'Uma limpeza dentária completa geralmente leva entre 30 a 60 minutos, dependendo da quantidade de tártaro e da condição das gengivas.');

  -- English
  INSERT INTO treatment_faq_translations (faq_id, language_code, question, answer) VALUES
    (faq_ids[1], 'en', 'How often should I get cleaning?', 'Professional dental cleaning is recommended every 6 months. Patients with greater propensity for tartar may need more frequent cleanings.'),
    (faq_ids[2], 'en', 'Does cleaning remove tooth enamel?', 'No, professional cleaning only removes bacterial plaque, tartar and surface stains. Tooth enamel is not damaged by the procedure.'),
    (faq_ids[3], 'en', 'Will I feel pain during cleaning?', 'The procedure generally does not cause pain. Patients with sensitive or inflamed gums may feel some discomfort, but it is well tolerable.'),
    (faq_ids[4], 'en', 'How long does cleaning take?', 'A complete dental cleaning generally takes between 30 to 60 minutes, depending on the amount of tartar and gum condition.');
END $$;
