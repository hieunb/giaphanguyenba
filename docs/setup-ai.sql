-- ============================================================
-- AI / RAG setup for Kho tài liệu
-- Run this in Supabase SQL editor
-- Requires: pgvector extension
-- ============================================================

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. document_chunks table (Gemini text-embedding-004 = 768 dims)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),
  chunk_index INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. IVFFlat index for fast approximate nearest-neighbor searches
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
  ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- 4. RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read chunks" ON public.document_chunks;
CREATE POLICY "Allow authenticated read chunks"
  ON public.document_chunks FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert chunks" ON public.document_chunks;
CREATE POLICY "Allow authenticated insert chunks"
  ON public.document_chunks FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete chunks" ON public.document_chunks;
CREATE POLICY "Allow authenticated delete chunks"
  ON public.document_chunks FOR DELETE
  TO authenticated USING (true);

-- 5. Vector similarity search function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.4,
  match_count INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  chunk_index INT,
  similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
