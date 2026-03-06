import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 30;

async function getEmbedding(text: string, geminiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini embedding error ${res.status}: ${err?.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return data.embedding.values as number[];
}

async function groqChat(systemPrompt: string, userMessage: string, groqKey: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const retryAfter = res.headers.get('retry-after');
    if (res.status === 429) {
      const secs = retryAfter ? parseInt(retryAfter) : 60;
      throw new Error(`RATE_LIMIT:${secs}`);
    }
    throw new Error(`Groq error ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

const SYSTEM_PROMPT = `Bạn là trợ lý AI chuyên về gia phả và lịch sử dòng họ.
Nhiệm vụ của bạn là trả lời câu hỏi của người dùng DỰA TRÊN các đoạn văn bản được cung cấp từ tài liệu gia phả.

Quy tắc:
- Chỉ trả lời dựa trên thông tin có trong các đoạn văn bản được cung cấp
- Nếu không tìm thấy thông tin liên quan, hãy nói rõ ràng là không có thông tin trong tài liệu
- Trả lời bằng tiếng Việt, rõ ràng và súc tích
- Có thể trích dẫn trực tiếp từ tài liệu nếu cần thiết
- Không bịa đặt thông tin ngoài những gì có trong tài liệu`;

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Câu hỏi không được để trống' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
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

    // 1. Embed the question with Gemini (direct REST)
    const embValues = await getEmbedding(question, geminiKey);

    // 2. Vector search in Supabase
    const { data: chunks, error: searchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: embValues,
      match_threshold: 0.4,
      match_count: 6,
    });

    if (searchError) {
      console.error('Vector search error:', searchError);
      return NextResponse.json({ error: 'Lỗi tìm kiếm: ' + searchError.message }, { status: 500 });
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer: 'Không tìm thấy thông tin liên quan trong kho tài liệu. Vui lòng thử câu hỏi khác hoặc kiểm tra xem tài liệu đã được xử lý AI chưa.',
        sources: [],
      });
    }

    // 3. Fetch document titles for sources
    const docIds: string[] = Array.from(new Set<string>(chunks.map((c: any) => c.document_id as string)));
    const { data: docs } = await supabase
      .from('documents')
      .select('id, title')
      .in('id', docIds);

    const docMap: Record<string, string> = {};
    (docs || []).forEach((d: any) => { docMap[d.id] = d.title; });

    // 4. Build context from chunks
    const context = chunks
      .map((c: any, i: number) => `[Đoạn ${i + 1} — ${docMap[c.document_id] || 'Tài liệu'}]\n${c.content}`)
      .join('\n\n---\n\n');

    // 5. Generate answer with Groq (14,400 RPD free tier)
    const userMessage = `=== CÁC ĐOẠN VĂN BẢN TỪ TÀI LIỆU ===\n\n${context}\n\n=== CÂU HỎI ===\n${question}`;

    let answer: string;
    try {
      answer = await groqChat(SYSTEM_PROMPT, userMessage, groqKey);
    } catch (genErr: any) {
      if (genErr?.message?.startsWith('RATE_LIMIT:')) {
        const secs = genErr.message.split(':')[1];
        return NextResponse.json(
          { error: `Hệ thống AI đang bận, vui lòng thử lại sau ${secs} giây.` },
          { status: 429 }
        );
      }
      throw genErr;
    }

    // 6. Build unique source list
    const sources = docIds.map(id => ({ id, title: docMap[id] || 'Tài liệu' }));

    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error('Ask AI error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
