-- Verify all treatments
SELECT
  t.id,
  t.slug,
  t.is_published,
  t.hero_image_url,
  t.icon_url,
  COUNT(DISTINCT tt.language_code) as translation_count,
  COUNT(DISTINCT tf.id) as faq_count,
  json_agg(DISTINCT tt.title) as titles
FROM treatments t
LEFT JOIN treatment_translations tt ON t.id = tt.treatment_id
LEFT JOIN treatment_faqs tf ON t.id = tf.treatment_id
GROUP BY t.id, t.slug, t.is_published, t.hero_image_url, t.icon_url
ORDER BY t.display_order;
