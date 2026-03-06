import AskAI from '@/components/AskAI';
import { Bot, BookOpen, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Hỏi đáp AI Gia phả' };

export default function AskPage() {
  return (
    <div className="flex-1 w-full flex flex-col pb-12">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Bot size={22} className="text-amber-600" />
          </div>
          <h1 className="title">Hỏi đáp AI Gia phả</h1>
        </div>
        <p className="text-stone-500 text-sm ml-[52px]">
          Đặt câu hỏi về lịch sử dòng họ — AI sẽ tìm kiếm trong kho tài liệu và trả lời
        </p>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* Info banner */}
        <div className="flex gap-2 items-start p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700 mb-4">
          <Info size={15} className="flex-shrink-0 mt-0.5" />
          <span>
            AI chỉ trả lời dựa trên tài liệu đã được <strong>xử lý AI</strong> trong{' '}
            <a href="/dashboard/admin/documents" className="underline font-medium hover:text-blue-900">
              Kho tài liệu
            </a>
            . Định dạng hỗ trợ: <strong>.docx</strong>, <strong>.txt</strong>
          </span>
        </div>

        {/* Chat box */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex-1">
          <AskAI />
        </div>

        {/* Source note */}
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1 justify-center">
          <BookOpen size={11} />
          Powered by Google Gemini · Chỉ tìm kiếm trong tài liệu dòng họ
        </p>
      </main>
    </div>
  );
}
