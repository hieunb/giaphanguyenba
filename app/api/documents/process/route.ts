import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import mammoth from 'mammoth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CHUNK_SIZE = 400;   // words per chunk
const CHUNK_OVERLAP = 40; // words overlap between chunks

function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(' ').trim();
    if (chunk.length > 30) chunks.push(chunk);
    if (i + CHUNK_SIZE >= words.length) break;
  }
  return chunks;
}

async function extractText(fileUrl: string, fileName: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`Không thể tải file: ${res.status}`);

  if (ext === 'docx') {
    const buffer = Buffer.from(await res.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (ext === 'txt') {
    return await res.text();
  } else {
    throw new Error(`Định dạng ${ext} chưa được hỗ trợ. Hệ thống hỗ trợ .docx và .txt`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { documentId, fileUrl, fileName } = await req.json();

    if (!documentId || !fileUrl || !fileName) {
      return NextResponse.json({ error: 'Thiếu thông tin tài liệu' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    // Extract text from document
    const text = await extractText(fileUrl, fileName);
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Tài liệu không có nội dung văn bản' }, { status: 400 });
    }

    // Chunk text
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Không thể chia nhỏ tài liệu' }, { status: 400 });
    }

    // Delete old chunks for this document
    await supabase.from('document_chunks').delete().eq('document_id', documentId);

    // Generate embeddings with Gemini
    const genAI = new GoogleGenerativeAI(geminiKey);
    const embModel = genAI.getGenerativeModel(
      { model: 'text-embedding-004' },
      { apiVersion: 'v1' }
    );

    const rows: Array<{ document_id: string; content: string; embedding: number[]; chunk_index: number }> = [];

    for (let i = 0; i < chunks.length; i++) {
      const { embedding } = await embModel.embedContent(chunks[i]);
      rows.push({
        document_id: documentId,
        content: chunks[i],
        embedding: embedding.values,
        chunk_index: i,
      });
      // Small delay to respect Gemini rate limits (100 RPM free tier)
      if (i > 0 && i % 50 === 0) await new Promise(r => setTimeout(r, 1000));
    }

    // Insert all chunks into Supabase
    const { error: insertError } = await supabase.from('document_chunks').insert(rows);
    if (insertError) {
      console.error('Insert chunks error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, chunksCreated: rows.length });
  } catch (err) {
    console.error('Process document error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
