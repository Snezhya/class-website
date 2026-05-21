-- ============================================================
-- Storage buckets untuk upload foto
-- Jalankan di Supabase Dashboard → SQL Editor → Run
-- (Fix error: "Bucket not found")
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('member-photos',  'member-photos',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery-photos', 'gallery-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('site-assets',    'site-assets',    true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies: publik bisa lihat, admin (login) bisa upload
DROP POLICY IF EXISTS "Public read member photos"  ON storage.objects;
DROP POLICY IF EXISTS "Auth upload member photos"    ON storage.objects;
DROP POLICY IF EXISTS "Auth update member photos"    ON storage.objects;
DROP POLICY IF EXISTS "Auth delete member photos"    ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth upload gallery photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth update gallery photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth delete gallery photos"   ON storage.objects;
DROP POLICY IF EXISTS "Public read site assets"      ON storage.objects;
DROP POLICY IF EXISTS "Auth upload site assets"      ON storage.objects;
DROP POLICY IF EXISTS "Auth update site assets"      ON storage.objects;
DROP POLICY IF EXISTS "Auth delete site assets"      ON storage.objects;

CREATE POLICY "Public read member photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'member-photos');
CREATE POLICY "Auth upload member photos"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'member-photos');
CREATE POLICY "Auth update member photos"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'member-photos');
CREATE POLICY "Auth delete member photos"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'member-photos');

CREATE POLICY "Public read gallery photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'gallery-photos');
CREATE POLICY "Auth upload gallery photos"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery-photos');
CREATE POLICY "Auth update gallery photos"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery-photos');
CREATE POLICY "Auth delete gallery photos"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery-photos');

CREATE POLICY "Public read site assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Auth upload site assets"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Auth update site assets"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets');
CREATE POLICY "Auth delete site assets"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets');
