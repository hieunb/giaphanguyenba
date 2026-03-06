-- ==========================================
-- SUPABASE STORAGE SETUP FOR DOCUMENTS
-- ==========================================
-- Run this SQL in Supabase SQL Editor to setup storage for document uploads

-- Create 'documents' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true, -- Public bucket so files can be accessed via URL
  52428800, -- 50MB file size limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- Policy 1: Allow authenticated users to upload documents
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid() IS NOT NULL
);

-- Policy 2: Allow public read access to all documents
DROP POLICY IF EXISTS "Public read access for documents" ON storage.objects;
CREATE POLICY "Public read access for documents"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents');

-- Policy 3: Allow authenticated users to update their own uploaded files
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow authenticated users to delete their own uploaded files
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check if bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
