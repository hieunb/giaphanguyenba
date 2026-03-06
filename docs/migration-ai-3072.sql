-- ============================================================
-- Migration: Upgrade AI embeddings from 768 → 3072 dimensions
-- Model: gemini-embedding-001 (replaces text-embedding-004)
-- Run this in Supabase SQL editor BEFORE re-processing documents
-- ============================================================

-- 1. Drop old index (must drop before altering column)
DROP INDEX IF EXISTS idx_document_chunks_embedding;

-- 2. Drop old function (depends on vector(768))
DROP FUNCTION IF EXISTS match_document_chunks(vector(768), float, int);

-- 3. Clear all old chunks (old 768-dim vectors are incompatible)
TRUNCATE TABLE public.document_chunks;

-- 4. Alter column to new dimension
ALTER TABLE public.document_chunks
  ALTER COLUMN embedding TYPE vector(3072);

-- 5. Recreate IVFFlat index for 3072 dims
CREATE INDEX idx_document_chunks_embedding
  ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- 6. Recreate search function with new dimension
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(3072),
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

-- 7. Reload schema cache
NOTIFY pgrst, 'reload schema';
