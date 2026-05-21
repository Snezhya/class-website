-- ============================================================
-- HANYA jika tabel app_settings SUDAH ADA (tanpa kolom logo)
-- Kalau error "app_settings does not exist" → jalankan create-app-settings.sql dulu
-- ============================================================

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS logo_header TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_favicon TEXT NOT NULL DEFAULT '/favicon.svg',
  ADD COLUMN IF NOT EXISTS logo_admin TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_placeholder TEXT NOT NULL DEFAULT '/hu-tao-placeholder.png',
  ADD COLUMN IF NOT EXISTS brand_title TEXT NOT NULL DEFAULT 'XI TJKT 1',
  ADD COLUMN IF NOT EXISTS brand_subtitle TEXT NOT NULL DEFAULT 'SMKN 1 BOYOLALI';
