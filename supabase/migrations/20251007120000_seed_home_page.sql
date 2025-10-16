-- Seed complete home page with all sections
-- This migration creates a fully CMS-driven home page structure

-- First, update the existing home page to mark as homepage
UPDATE cms_pages
SET is_homepage = true,
    template = 'home',
    display_order = 0
WHERE slug = 'home';

-- Get the home page ID for section creation
DO $$
DECLARE
  home_page_id UUID;
BEGIN
  SELECT id INTO home_page_id FROM cms_pages WHERE slug = 'home';

  -- Delete existing sections to start fresh
  DELETE FROM cms_page_sections WHERE page_id = home_page_id;

  -- 1. HERO SECTION (video background)
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'hero',
    1,
    true,
    jsonb_build_object(
      'video_url', '/videos/DJI_20250925180342_0012_D.mp4',
      'video_enabled', true,
      'overlay_gradient', 'from-black/50 via-black/20 to-transparent',
      'show_stats', true,
      'stats', jsonb_build_array(
        jsonb_build_object('icon', 'Shield', 'value', '20+', 'label_key', 'yearsLabel'),
        jsonb_build_object('icon', 'Clock', 'value', '24h', 'label_key', 'responseLabel')
      )
    )
  );

  -- Add hero translations
  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'title', 'O Seu Sorriso é a Nossa Prioridade',
      'subtitle', 'Tratamentos dentários de excelência no coração de Lisboa',
      'badge', 'Clínica de Confiança',
      'cta_primary_text', 'Marcar Consulta',
      'cta_primary_url', 'https://booking.clinicaferreiraborges.pt',
      'cta_secondary_text', 'Ligar Agora',
      'cta_secondary_url', 'tel:+351935189807',
      'yearsLabel', 'Anos de Experiência',
      'responseLabel', 'Resposta Rápida'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'hero';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'title', 'Your Smile is Our Priority',
      'subtitle', 'Excellence in dental care in the heart of Lisbon',
      'badge', 'Trusted Clinic',
      'cta_primary_text', 'Book Appointment',
      'cta_primary_url', 'https://booking.clinicaferreiraborges.pt',
      'cta_secondary_text', 'Call Now',
      'cta_secondary_url', 'tel:+351935189807',
      'yearsLabel', 'Years of Experience',
      'responseLabel', 'Quick Response'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'hero';

  -- 2. CERTIFICATION BADGES SECTION
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'certifications',
    2,
    true,
    jsonb_build_object(
      'show_title', false,
      'layout', 'carousel',
      'background', 'gray-50'
    )
  );

  -- 3. TREATMENTS/SERVICES SECTION (dynamic from database)
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'treatments_grid',
    3,
    true,
    jsonb_build_object(
      'columns', 5,
      'show_popular', true,
      'show_icons', true,
      'limit', null
    )
  );

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'label', 'Tratamentos',
      'title', 'Os Nossos Tratamentos',
      'subtitle', 'Oferecemos uma gama completa de serviços dentários adaptados às suas necessidades',
      'footer_text', 'Não encontra o que procura? Fale connosco e teremos todo o gosto em ajudar.',
      'cta_text', 'Fale Connosco'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'treatments_grid';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'label', 'Treatments',
      'title', 'Our Treatments',
      'subtitle', 'We offer a complete range of dental services tailored to your needs',
      'footer_text', 'Can''t find what you''re looking for? Talk to us and we''ll be happy to help.',
      'cta_text', 'Talk to Us'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'treatments_grid';

  -- 4. SAFETY SECTION (two-column layout)
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'two_column',
    4,
    true,
    jsonb_build_object(
      'image_url', '/images/safety-protocols.jpg',
      'image_position', 'right',
      'background', 'white',
      'features', jsonb_build_array(
        jsonb_build_object('icon', 'Shield', 'title_key', 'protocol1', 'description_key', 'protocol1_desc'),
        jsonb_build_object('icon', 'Activity', 'title_key', 'protocol2', 'description_key', 'protocol2_desc'),
        jsonb_build_object('icon', 'CheckCircle', 'title_key', 'protocol3', 'description_key', 'protocol3_desc')
      )
    )
  );

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'label', 'Segurança',
      'title', 'Segurança e Higiene',
      'subtitle', 'O seu bem-estar é a nossa prioridade',
      'protocol1', 'Esterilização Avançada',
      'protocol1_desc', 'Todos os instrumentos são esterilizados usando tecnologia de última geração',
      'protocol2', 'Materiais Descartáveis',
      'protocol2_desc', 'Utilizamos materiais descartáveis sempre que possível',
      'protocol3', 'Protocolos Rigorosos',
      'protocol3_desc', 'Seguimos as normas mais rigorosas de segurança e higiene'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'two_column' AND display_order = 4;

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'label', 'Safety',
      'title', 'Safety and Hygiene',
      'subtitle', 'Your well-being is our priority',
      'protocol1', 'Advanced Sterilization',
      'protocol1_desc', 'All instruments are sterilized using cutting-edge technology',
      'protocol2', 'Disposable Materials',
      'protocol2_desc', 'We use disposable materials whenever possible',
      'protocol3', 'Rigorous Protocols',
      'protocol3_desc', 'We follow the strictest safety and hygiene standards'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'two_column' AND display_order = 4;

  -- 5. TEAM CREDENTIALS SECTION
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'team_credentials',
    5,
    true,
    jsonb_build_object(
      'show_photos', true,
      'show_credentials', true,
      'layout', 'grid'
    )
  );

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'label', 'Equipa',
      'title', 'Equipa Especializada',
      'subtitle', 'Profissionais altamente qualificados e experientes'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'team_credentials';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'label', 'Team',
      'title', 'Specialized Team',
      'subtitle', 'Highly qualified and experienced professionals'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'team_credentials';

  -- 6. COMMITMENT SECTION (features grid)
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'features',
    6,
    true,
    jsonb_build_object(
      'columns', 3,
      'icon_style', 'primary',
      'background', 'gray-50'
    )
  );

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'label', 'Compromisso',
      'title', 'O Nosso Compromisso',
      'subtitle', 'Dedicados à excelência no cuidado dentário'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'features' AND display_order = 6;

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'label', 'Commitment',
      'title', 'Our Commitment',
      'subtitle', 'Dedicated to excellence in dental care'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'features' AND display_order = 6;

  -- 7. TESTIMONIALS SECTION (Google Reviews)
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'testimonials',
    7,
    true,
    jsonb_build_object(
      'source', 'google',
      'layout', 'carousel',
      'show_rating', true,
      'show_date', true,
      'limit', 10
    )
  );

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'label', 'Testemunhos',
      'title', 'O Que Dizem os Nossos Pacientes',
      'subtitle', 'Avaliações reais de pacientes satisfeitos'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'testimonials';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'label', 'Testimonials',
      'title', 'What Our Patients Say',
      'subtitle', 'Real reviews from satisfied patients'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'testimonials';

  -- 8. FAQ SECTION
  INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active, settings)
  VALUES (
    home_page_id,
    'faq',
    8,
    true,
    jsonb_build_object(
      'category', 'general',
      'accordion_style', true,
      'show_category_filter', false,
      'limit', 6
    )
  );

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'pt',
    jsonb_build_object(
      'label', 'FAQ',
      'title', 'Perguntas Frequentes',
      'subtitle', 'Encontre respostas às questões mais comuns'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'faq';

  INSERT INTO cms_section_translations (section_id, language_code, content)
  SELECT
    id,
    'en',
    jsonb_build_object(
      'label', 'FAQ',
      'title', 'Frequently Asked Questions',
      'subtitle', 'Find answers to the most common questions'
    )
  FROM cms_page_sections
  WHERE page_id = home_page_id AND section_type = 'faq';

END $$;

-- Create tables for additional section types support

-- TESTIMONIALS (external sources like Google Reviews)
CREATE TABLE IF NOT EXISTS cms_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'google', 'manual', 'trustpilot'
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review_date DATE,
  external_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_testimonial_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimonial_id UUID NOT NULL REFERENCES cms_testimonials(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(testimonial_id, language_code)
);

-- Enable RLS
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_testimonial_translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Testimonials viewable by everyone"
  ON cms_testimonials FOR SELECT
  USING (is_published = true);

CREATE POLICY "Testimonial translations viewable by everyone"
  ON cms_testimonial_translations FOR SELECT
  USING (true);

-- Authenticated write access
CREATE POLICY "Testimonials editable by authenticated users"
  ON cms_testimonials FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Testimonial translations editable by authenticated users"
  ON cms_testimonial_translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_testimonials_featured ON cms_testimonials(is_featured, display_order);
CREATE INDEX idx_testimonials_source ON cms_testimonials(source);
CREATE INDEX idx_testimonial_translations_locale ON cms_testimonial_translations(language_code);

-- GALLERY IMAGES
CREATE TABLE IF NOT EXISTS cms_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  category TEXT, -- 'clinic', 'team', 'treatments', 'equipment'
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_gallery_image_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES cms_gallery_images(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  caption TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(image_id, language_code)
);

-- Enable RLS
ALTER TABLE cms_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_gallery_image_translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Gallery images viewable by everyone"
  ON cms_gallery_images FOR SELECT
  USING (is_published = true);

CREATE POLICY "Gallery image translations viewable by everyone"
  ON cms_gallery_image_translations FOR SELECT
  USING (true);

-- Authenticated write access
CREATE POLICY "Gallery images editable by authenticated users"
  ON cms_gallery_images FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Gallery image translations editable by authenticated users"
  ON cms_gallery_image_translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_gallery_images_category ON cms_gallery_images(category, display_order);
CREATE INDEX idx_gallery_image_translations_locale ON cms_gallery_image_translations(language_code);

-- Seed some sample testimonials (Google Reviews style)
INSERT INTO cms_testimonials (source, author_name, rating, review_date, is_featured, is_published, display_order)
VALUES
  ('google', 'Maria Silva', 5.0, '2025-09-15', true, true, 1),
  ('google', 'João Santos', 5.0, '2025-09-10', true, true, 2),
  ('google', 'Ana Rodrigues', 5.0, '2025-08-28', true, true, 3),
  ('google', 'Pedro Costa', 5.0, '2025-08-15', false, true, 4);

-- Add Portuguese translations for testimonials
INSERT INTO cms_testimonial_translations (testimonial_id, language_code, review_text)
SELECT
  id,
  'pt',
  CASE
    WHEN author_name = 'Maria Silva' THEN 'Excelente clínica! Profissionais muito competentes e atenciosos. Recomendo vivamente!'
    WHEN author_name = 'João Santos' THEN 'Atendimento de primeira qualidade. Instalações modernas e equipa muito profissional.'
    WHEN author_name = 'Ana Rodrigues' THEN 'Muito satisfeita com o tratamento. A Dra. Ana é excelente e muito dedicada aos pacientes.'
    WHEN author_name = 'Pedro Costa' THEN 'Ótima experiência! Tratamento indolor e resultados fantásticos.'
  END
FROM cms_testimonials;

-- Add English translations for testimonials
INSERT INTO cms_testimonial_translations (testimonial_id, language_code, review_text)
SELECT
  id,
  'en',
  CASE
    WHEN author_name = 'Maria Silva' THEN 'Excellent clinic! Very competent and attentive professionals. Highly recommend!'
    WHEN author_name = 'João Santos' THEN 'First-class service. Modern facilities and very professional team.'
    WHEN author_name = 'Ana Rodrigues' THEN 'Very satisfied with the treatment. Dr. Ana is excellent and very dedicated to her patients.'
    WHEN author_name = 'Pedro Costa' THEN 'Great experience! Painless treatment and fantastic results.'
  END
FROM cms_testimonials;

-- Seed some gallery images
INSERT INTO cms_gallery_images (image_url, thumbnail_url, category, display_order, is_published)
VALUES
  ('/images/gallery/clinic-exterior.jpg', '/images/gallery/thumbs/clinic-exterior.jpg', 'clinic', 1, true),
  ('/images/gallery/reception.jpg', '/images/gallery/thumbs/reception.jpg', 'clinic', 2, true),
  ('/images/gallery/treatment-room.jpg', '/images/gallery/thumbs/treatment-room.jpg', 'clinic', 3, true),
  ('/images/gallery/equipment.jpg', '/images/gallery/thumbs/equipment.jpg', 'equipment', 4, true);

-- Add Portuguese captions
INSERT INTO cms_gallery_image_translations (image_id, language_code, caption, description)
SELECT
  id,
  'pt',
  CASE
    WHEN image_url LIKE '%clinic-exterior%' THEN 'Exterior da Clínica'
    WHEN image_url LIKE '%reception%' THEN 'Recepção'
    WHEN image_url LIKE '%treatment-room%' THEN 'Sala de Tratamento'
    WHEN image_url LIKE '%equipment%' THEN 'Equipamento Moderno'
  END,
  CASE
    WHEN image_url LIKE '%clinic-exterior%' THEN 'Instalações modernas no coração de Lisboa'
    WHEN image_url LIKE '%reception%' THEN 'Espaço de receção acolhedor e confortável'
    WHEN image_url LIKE '%treatment-room%' THEN 'Salas equipadas com tecnologia de última geração'
    WHEN image_url LIKE '%equipment%' THEN 'Tecnologia avançada para os melhores resultados'
  END
FROM cms_gallery_images;

-- Add English captions
INSERT INTO cms_gallery_image_translations (image_id, language_code, caption, description)
SELECT
  id,
  'en',
  CASE
    WHEN image_url LIKE '%clinic-exterior%' THEN 'Clinic Exterior'
    WHEN image_url LIKE '%reception%' THEN 'Reception'
    WHEN image_url LIKE '%treatment-room%' THEN 'Treatment Room'
    WHEN image_url LIKE '%equipment%' THEN 'Modern Equipment'
  END,
  CASE
    WHEN image_url LIKE '%clinic-exterior%' THEN 'Modern facilities in the heart of Lisbon'
    WHEN image_url LIKE '%reception%' THEN 'Welcoming and comfortable reception area'
    WHEN image_url LIKE '%treatment-room%' THEN 'Rooms equipped with cutting-edge technology'
    WHEN image_url LIKE '%equipment%' THEN 'Advanced technology for the best results'
  END
FROM cms_gallery_images;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_testimonials_updated_at
  BEFORE UPDATE ON cms_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_testimonial_translations_updated_at
  BEFORE UPDATE ON cms_testimonial_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_gallery_images_updated_at
  BEFORE UPDATE ON cms_gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_gallery_image_translations_updated_at
  BEFORE UPDATE ON cms_gallery_image_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
