SELECT
  t.id,
  t.slug,
  t.is_published,
  t.hero_image_url,
  t.icon_url,
  json_agg(
    json_build_object(
      'language_code', tt.language_code,
      'title', tt.title
    )
  ) as translations
FROM treatments t
LEFT JOIN treatment_translations tt ON t.id = tt.treatment_id
GROUP BY t.id
ORDER BY t.slug;
