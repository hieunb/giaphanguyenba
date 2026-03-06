-- ============================================================
-- Gia phả ký (Chronicles) - Setup script
-- Run this in Supabase SQL editor
-- Safe to re-run (idempotent)
-- ============================================================

-- 1. Chronicles table
CREATE TABLE IF NOT EXISTS public.chronicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1b. Add missing columns to existing table (safe for re-runs)
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.chronicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add CHECK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chronicles_status_check') THEN
    ALTER TABLE public.chronicles
      ADD CONSTRAINT chronicles_status_check CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

-- 2. Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_chronicles_slug ON public.chronicles(slug);
CREATE INDEX IF NOT EXISTS idx_chronicles_status ON public.chronicles(status);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_chronicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chronicles_updated_at ON public.chronicles;
CREATE TRIGGER chronicles_updated_at
  BEFORE UPDATE ON public.chronicles
  FOR EACH ROW EXECUTE FUNCTION update_chronicles_updated_at();

-- 4. RLS policies
ALTER TABLE public.chronicles ENABLE ROW LEVEL SECURITY;

-- Public: read published articles
DROP POLICY IF EXISTS "Allow public read published chronicles" ON public.chronicles;
CREATE POLICY "Allow public read published chronicles"
  ON public.chronicles FOR SELECT
  USING (status = 'published');

-- Authenticated: read all articles (including drafts)
DROP POLICY IF EXISTS "Allow authenticated read all chronicles" ON public.chronicles;
CREATE POLICY "Allow authenticated read all chronicles"
  ON public.chronicles FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated: insert chronicles
DROP POLICY IF EXISTS "Allow authenticated insert chronicles" ON public.chronicles;
CREATE POLICY "Allow authenticated insert chronicles"
  ON public.chronicles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated: update chronicles
DROP POLICY IF EXISTS "Allow authenticated update chronicles" ON public.chronicles;
CREATE POLICY "Allow authenticated update chronicles"
  ON public.chronicles FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated: delete chronicles
DROP POLICY IF EXISTS "Allow authenticated delete chronicles" ON public.chronicles;
CREATE POLICY "Allow authenticated delete chronicles"
  ON public.chronicles FOR DELETE
  TO authenticated
  USING (true);

-- 5. Storage bucket for cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chronicles',
  'chronicles',
  true,
  10485760, -- 10MB limit for images
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 6. Storage RLS for chronicles bucket
DROP POLICY IF EXISTS "Allow public read chronicles images" ON storage.objects;
CREATE POLICY "Allow public read chronicles images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chronicles');

DROP POLICY IF EXISTS "Allow authenticated upload chronicles images" ON storage.objects;
CREATE POLICY "Allow authenticated upload chronicles images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chronicles');

DROP POLICY IF EXISTS "Allow authenticated delete chronicles images" ON storage.objects;
CREATE POLICY "Allow authenticated delete chronicles images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chronicles');

-- 7. Reload PostgREST schema cache (fixes "column not found in schema cache" errors)
NOTIFY pgrst, 'reload schema';
