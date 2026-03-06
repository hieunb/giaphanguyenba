'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { deleteChronicle, Chronicle } from '@/app/actions/chronicles';
import ChronicleForm from './ChronicleForm';

interface ChronicleListProps {
  chronicles: Chronicle[];
}

export default function ChronicleList({ chronicles }: ChronicleListProps) {
  const router = useRouter();
  const [editingChronicle, setEditingChronicle] = useState<Chronicle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa bài viết "${title}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    const result = await deleteChronicle(id);
    if (result?.error) {
      alert('Lỗi: ' + result.error);
    } else {
      router.refresh();
    }
    setDeletingId(null);
  };

  if (chronicles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
        <p>Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!</p>
      </div>
    );
  }

  return (
    <>
      {editingChronicle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Chỉnh sửa bài viết</h3>
              <button
                onClick={() => setEditingChronicle(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <ChronicleForm
              editChronicle={editingChronicle}
              onClose={() => { setEditingChronicle(null); router.refresh(); }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {chronicles.map((chronicle) => (
          <div
            key={chronicle.id}
            className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            {/* Cover image thumbnail */}
            {chronicle.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={chronicle.cover_image_url}
                alt={chronicle.title}
                className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-20 h-14 rounded-lg flex-shrink-0 bg-amber-50 flex items-center justify-center">
                <BookOpen size={24} className="text-amber-300" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-800 truncate">{chronicle.title}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    chronicle.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {chronicle.status === 'published' ? (
                    <span className="flex items-center gap-1"><Eye size={10} /> Đã xuất bản</span>
                  ) : (
                    <span className="flex items-center gap-1"><EyeOff size={10} /> Bản nháp</span>
                  )}
                </span>
              </div>
              {chronicle.excerpt && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{chronicle.excerpt}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                /{chronicle.slug} •{' '}
                {chronicle.published_at
                  ? new Date(chronicle.published_at).toLocaleDateString('vi-VN')
                  : 'Chưa xuất bản'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditingChronicle(chronicle)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Chỉnh sửa"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(chronicle.id, chronicle.title)}
                disabled={deletingId === chronicle.id}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
