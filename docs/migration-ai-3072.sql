-- ============================================================
-- Migration: Fix AI embeddings - use gemini-embedding-001 with 768 dims
-- Model: gemini-embedding-001 with outputDimensionality=768
-- Run this in Supabase SQL editor BEFORE re-processing documents
-- ============================================================

-- 1. Drop old index
DROP INDEX IF EXISTS idx_document_chunks_embedding;

-- 2. Drop old functions (any dimension variant)
DROP FUNCTION IF EXISTS match_document_chunks(vector(3072), float, int);
DROP FUNCTION IF EXISTS match_document_chunks(vector(768), float, int);

-- 3. Clear all old chunks
TRUNCATE TABLE public.document_chunks;

-- 4. Ensure column is vector(768)
ALTER TABLE public.document_chunks
  ALTER COLUMN embedding TYPE vector(768);

-- 5. Recreate IVFFlat index for 768 dims
CREATE INDEX idx_document_chunks_embedding
  ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- 6. Recreate search function with 768 dims
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

-- 7. Reload schema cache
NOTIFY pgrst, 'reload schema';
