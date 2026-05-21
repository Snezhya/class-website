-- ============================================================
-- XI TJKT 1 Class Portal — Full Supabase schema
-- Jalankan sekali di: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── DATA TABLES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.member (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL DEFAULT '',
  nis          TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'Anggota',
  is_core      BOOLEAN NOT NULL DEFAULT false,
  bio          TEXT NOT NULL DEFAULT '',
  skills       JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'offline'
                 CHECK (status IN ('active', 'away', 'offline')),
  photo        TEXT NOT NULL DEFAULT '/hu-tao-placeholder.png',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  priority    TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'overdue')),
  due_date    DATE,
  category    TEXT NOT NULL DEFAULT 'Umum',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule (
  id         BIGSERIAL PRIMARY KEY,
  day        TEXT NOT NULL
               CHECK (day IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
  time       TEXT NOT NULL DEFAULT '',
  subject    TEXT NOT NULL DEFAULT '',
  teacher    TEXT NOT NULL DEFAULT '',
  room       TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'theory'
               CHECK (type IN ('theory', 'practical', 'exam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.note (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'note'
               CHECK (type IN ('announcement', 'note', 'log')),
  category   TEXT NOT NULL DEFAULT 'General'
               CHECK (category IN ('System', 'Academic', 'Class', 'General')),
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  author     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Album = thumbnail di UI; gallery_photo = foto anak (inspect only)
CREATE TABLE IF NOT EXISTS public.gallery_album (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'Event'
                CHECK (category IN ('Practicum', 'Event', 'Exam', 'Classroom')),
  description TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '/hu-tao-placeholder.png',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_photo (
  id          BIGSERIAL PRIMARY KEY,
  album_id    BIGINT NOT NULL REFERENCES public.gallery_album(id) ON DELETE CASCADE,
  image       TEXT NOT NULL DEFAULT '/hu-tao-placeholder.png',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_photo_album ON public.gallery_photo(album_id);

-- Theme & admin panel (satu baris global, id = 1)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id                    INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  theme                 TEXT NOT NULL DEFAULT 'dark-navy'
                        CHECK (theme IN ('dark-navy', 'dark-slate', 'pure-black')),
  accent_color          TEXT NOT NULL DEFAULT '#3b82f6',
  background_type       TEXT NOT NULL DEFAULT 'dot'
                        CHECK (background_type IN ('gradient', 'grid', 'dot', 'image')),
  background_image      TEXT NOT NULL DEFAULT '/hu-tao-placeholder.png',
  blur_intensity        INTEGER NOT NULL DEFAULT 8,
  opacity               INTEGER NOT NULL DEFAULT 85,
  glow_amount           INTEGER NOT NULL DEFAULT 40,
  show_hero             BOOLEAN NOT NULL DEFAULT true,
  show_stats            BOOLEAN NOT NULL DEFAULT true,
  show_schedule_preview BOOLEAN NOT NULL DEFAULT true,
  show_activity_log     BOOLEAN NOT NULL DEFAULT true,
  hero_title            TEXT NOT NULL DEFAULT 'XI TJKT 1 PORTAL',
  hero_subtitle         TEXT NOT NULL DEFAULT 'Networking & Telecommunications Systems Developer Terminal. SMKN 1 Boyolali Class Hub.',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Activity log (admin panel / home terminal)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id         BIGSERIAL PRIMARY KEY,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

ALTER TABLE public.member        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_album ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log  ENABLE ROW LEVEL SECURITY;

-- Drop lama agar skrip bisa di-run ulang
DROP POLICY IF EXISTS "Public read member"        ON public.member;
DROP POLICY IF EXISTS "Auth write member"         ON public.member;
DROP POLICY IF EXISTS "Public read task"          ON public.task;
DROP POLICY IF EXISTS "Auth write task"           ON public.task;
DROP POLICY IF EXISTS "Public read schedule"      ON public.schedule;
DROP POLICY IF EXISTS "Auth write schedule"       ON public.schedule;
DROP POLICY IF EXISTS "Public read note"          ON public.note;
DROP POLICY IF EXISTS "Auth write note"           ON public.note;
DROP POLICY IF EXISTS "Public read gallery_album"  ON public.gallery_album;
DROP POLICY IF EXISTS "Auth write gallery_album"   ON public.gallery_album;
DROP POLICY IF EXISTS "Public read gallery_photo"  ON public.gallery_photo;
DROP POLICY IF EXISTS "Auth write gallery_photo"   ON public.gallery_photo;
DROP POLICY IF EXISTS "Public read app_settings"  ON public.app_settings;
DROP POLICY IF EXISTS "Auth write app_settings"   ON public.app_settings;
DROP POLICY IF EXISTS "Public read activity_log"  ON public.activity_log;
DROP POLICY IF EXISTS "Auth insert activity_log"  ON public.activity_log;
DROP POLICY IF EXISTS "Auth delete activity_log"  ON public.activity_log;

-- Baca publik (website tanpa login)
CREATE POLICY "Public read member"       ON public.member       FOR SELECT USING (true);
CREATE POLICY "Public read task"         ON public.task         FOR SELECT USING (true);
CREATE POLICY "Public read schedule"     ON public.schedule     FOR SELECT USING (true);
CREATE POLICY "Public read note"         ON public.note         FOR SELECT USING (true);
CREATE POLICY "Public read gallery_album"  ON public.gallery_album  FOR SELECT USING (true);
CREATE POLICY "Public read gallery_photo"  ON public.gallery_photo  FOR SELECT USING (true);
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public read activity_log" ON public.activity_log FOR SELECT USING (true);

-- Tulis hanya admin (authenticated)
CREATE POLICY "Auth write member"       ON public.member       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write task"         ON public.task         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write schedule"     ON public.schedule     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write note"         ON public.note         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write gallery_album"  ON public.gallery_album  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write gallery_photo"  ON public.gallery_photo  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write app_settings" ON public.app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth insert activity_log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth delete activity_log" ON public.activity_log FOR DELETE TO authenticated USING (true);

-- ── REALTIME ─────────────────────────────────────────────────

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.member;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.task;          EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule;      EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.note;          EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_album;  EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_photo;  EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;  EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;  EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── STORAGE: SEMUA FOTO ──────────────────────────────────────
-- Bucket 1: member-photos   → foto profil siswa (Admin → Members)
-- Bucket 2: gallery-photos  → foto galeri kelas (Gallery)
-- Bucket 3: site-assets     → background / aset tema (Admin → Theme)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('member-photos',  'member-photos',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery-photos', 'gallery-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('site-assets',    'site-assets',    true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies (baca publik, upload admin)
DROP POLICY IF EXISTS "Public read member photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth upload member photos"     ON storage.objects;
DROP POLICY IF EXISTS "Auth update member photos"   ON storage.objects;
DROP POLICY IF EXISTS "Auth delete member photos"   ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery photos"  ON storage.objects;
DROP POLICY IF EXISTS "Auth upload gallery photos"  ON storage.objects;
DROP POLICY IF EXISTS "Auth update gallery photos"  ON storage.objects;
DROP POLICY IF EXISTS "Auth delete gallery photos"   ON storage.objects;
DROP POLICY IF EXISTS "Public read site assets"     ON storage.objects;
DROP POLICY IF EXISTS "Auth upload site assets"     ON storage.objects;
DROP POLICY IF EXISTS "Auth update site assets"     ON storage.objects;
DROP POLICY IF EXISTS "Auth delete site assets"     ON storage.objects;

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
