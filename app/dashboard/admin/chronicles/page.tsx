import { BookOpen, Eye, EyeOff, FileText } from 'lucide-react';
import { getChronicles } from '@/app/actions/chronicles';
import ChronicleForm from '@/components/ChronicleForm';
import ChronicleList from '@/components/ChronicleList';

export const dynamic = 'force-dynamic';

export default async function AdminChroniclesPage() {
  const chronicles = await getChronicles(false);

  const published = chronicles.filter((c) => c.status === 'published');
  const drafts = chronicles.filter((c) => c.status === 'draft');

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/60">
              <BookOpen className="size-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">📖 Quản lý Gia phả ký</h1>
              <p className="text-stone-500 text-sm mt-1">
                Viết và quản lý các bài viết ghi chép lịch sử dòng họ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/60">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="size-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Tổng bài viết</span>
          </div>
          <p className="text-3xl font-bold text-amber-900">{chronicles.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Đã xuất bản</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{published.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/60">
          <div className="flex items-center gap-3 mb-2">
            <EyeOff className="size-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Bản nháp</span>
          </div>
          <p className="text-3xl font-bold text-gray-700">{drafts.length}</p>
        </div>
      </div>

      {/* Create form */}
      <div className="mb-6">
        <ChronicleForm />
      </div>

      {/* List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tất cả bài viết</h2>
        <ChronicleList chronicles={chronicles} />
      </div>
    </main>
  );
}
