import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 30;

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

    const genAI = new GoogleGenerativeAI(geminiKey);

    // 1. Embed the question
    const embModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const { embedding } = await embModel.embedContent(question);

    // 2. Vector search in Supabase
    const { data: chunks, error: searchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: embedding.values,
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
    const docIds: string[] = [...new Set(chunks.map((c: any) => c.document_id))];
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

    // 5. Generate answer with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `${SYSTEM_PROMPT}\n\n=== CÁC ĐOẠN VĂN BẢN TỪ TÀI LIỆU ===\n\n${context}\n\n=== CÂU HỎI ===\n${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // 6. Build unique source list
    const sources = docIds.map(id => ({ id, title: docMap[id] || 'Tài liệu' }));

    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error('Ask AI error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
