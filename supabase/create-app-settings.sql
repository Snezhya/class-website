-- ============================================================
-- Buat tabel app_settings (tema + logo + brand)
-- Jalankan INI jika error: relation "public.app_settings" does not exist
-- ============================================================

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
  logo_header           TEXT NOT NULL DEFAULT '',
  logo_favicon          TEXT NOT NULL DEFAULT '/favicon.svg',
  logo_admin            TEXT NOT NULL DEFAULT '',
  logo_placeholder      TEXT NOT NULL DEFAULT '/hu-tao-placeholder.png',
  brand_title           TEXT NOT NULL DEFAULT 'XI TJKT 1',
  brand_subtitle        TEXT NOT NULL DEFAULT 'SMKN 1 BOYOLALI',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Auth write app_settings" ON public.app_settings;

CREATE POLICY "Public read app_settings"
  ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Auth write app_settings"
  ON public.app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
