-- Create storage buckets for treatments and team photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('treatment-images', 'treatment-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('treatment-icons', 'treatment-icons', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('team-photos', 'team-photos', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for treatment-images bucket
CREATE POLICY "Public Access for treatment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'treatment-images');

CREATE POLICY "Authenticated users can upload treatment images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'treatment-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update treatment images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'treatment-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete treatment images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'treatment-images'
  AND auth.role() = 'authenticated'
);

-- Storage policies for treatment-icons bucket
CREATE POLICY "Public Access for treatment icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'treatment-icons');

CREATE POLICY "Authenticated users can upload treatment icons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'treatment-icons'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update treatment icons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'treatment-icons'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete treatment icons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'treatment-icons'
  AND auth.role() = 'authenticated'
);

-- Storage policies for team-photos bucket
CREATE POLICY "Public Access for team photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-photos');

CREATE POLICY "Authenticated users can upload team photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'team-photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update team photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'team-photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete team photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'team-photos'
  AND auth.role() = 'authenticated'
);
