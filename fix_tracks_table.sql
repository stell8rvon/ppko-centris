-- ============================================================
-- Perbaikan tabel tracks & modules untuk KO AWIS
-- Jalankan ini di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom slug ke tabel tracks (jika belum ada)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Isi slug berdasarkan title yang sudah ada
UPDATE tracks SET slug = 'hilir'        WHERE lower(title) LIKE '%hilir%'        AND slug IS NULL;
UPDATE tracks SET slug = 'entrepreneur' WHERE lower(title) LIKE '%entrepreneur%'  AND slug IS NULL;
UPDATE tracks SET slug = 'digital'      WHERE lower(title) LIKE '%digital%'       AND slug IS NULL;
UPDATE tracks SET slug = 'sirkular'     WHERE lower(title) LIKE '%sirkular%'      AND slug IS NULL;

-- 3. Jika tabel tracks masih kosong, insert 4 pilar default
INSERT INTO tracks (title, slug, description, icon)
SELECT * FROM (VALUES
  ('Hilir',        'hilir',        'Pengolahan & Produksi Kakao',    '🏭'),
  ('Entrepreneur', 'entrepreneur', 'Bisnis & Kewirausahaan Kakao',   '💼'),
  ('Digital',      'digital',      'Teknologi & Inovasi Digital',    '💻'),
  ('Sirkular',     'sirkular',     'Ekosistem Berkelanjutan Kakao',  '♻️')
) AS v(title, slug, description, icon)
WHERE NOT EXISTS (SELECT 1 FROM tracks);

-- 4. Pastikan slug unik
CREATE UNIQUE INDEX IF NOT EXISTS tracks_slug_unique ON tracks(slug);

-- 5. Cek hasilnya
SELECT id, title, slug, icon FROM tracks ORDER BY id;
