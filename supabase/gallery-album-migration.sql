-- Album + foto anak (jalankan setelah schema.sql jika masih pakai tabel gallery lama)
-- Grid hanya menampilkan album; foto anak hanya di lightbox inspect

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

ALTER TABLE public.gallery_album ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read gallery_album" ON public.gallery_album;
DROP POLICY IF EXISTS "Auth write gallery_album" ON public.gallery_album;
DROP POLICY IF EXISTS "Public read gallery_photo" ON public.gallery_photo;
DROP POLICY IF EXISTS "Auth write gallery_photo" ON public.gallery_photo;

CREATE POLICY "Public read gallery_album" ON public.gallery_album FOR SELECT USING (true);
CREATE POLICY "Auth write gallery_album" ON public.gallery_album FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read gallery_photo" ON public.gallery_photo FOR SELECT USING (true);
CREATE POLICY "Auth write gallery_photo" ON public.gallery_photo FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_album; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_photo; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Migrasi data lama dari public.gallery (sekali saja, jika album masih kosong)
INSERT INTO public.gallery_album (title, category, description, cover_image, date, created_at)
SELECT g.title, g.category, g.description, g.image, g.date, g.created_at
FROM public.gallery g
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gallery')
  AND NOT EXISTS (SELECT 1 FROM public.gallery_album LIMIT 1);
