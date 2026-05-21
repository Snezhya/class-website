-- Nomor absen siswa (sinkron dengan council & roster)
ALTER TABLE public.member
  ADD COLUMN IF NOT EXISTS absen_number INTEGER NOT NULL DEFAULT 0;

-- Isi nomor dari sort_order yang ada (sekali)
UPDATE public.member
SET absen_number = sort_order
WHERE absen_number = 0 AND sort_order > 0;

UPDATE public.member m
SET absen_number = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order NULLS LAST, id) AS rn
  FROM public.member
) sub
WHERE m.id = sub.id AND m.absen_number = 0;

CREATE INDEX IF NOT EXISTS idx_member_absen ON public.member(absen_number);
