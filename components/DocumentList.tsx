'use client';

import { useState } from 'react';
import { Trash2, ExternalLink, FileText, Image, Video, File } from 'lucide-react';
import { deleteDocument } from '@/app/actions/documents';

const FILE_ICONS: Record<string, any> = {
  pdf: FileText,
  image: Image,
  video: Video,
  default: File,
};

export default function DocumentList({ documents }: any) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    setDeletingId(id);
    await deleteDocument(id);
    setDeletingId(null);
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return FILE_ICONS.default;
    if (fileType.includes('pdf')) return FILE_ICONS.pdf;
    if (fileType.includes('image')) return FILE_ICONS.image;
    if (fileType.includes('video')) return FILE_ICONS.video;
    return FILE_ICONS.default;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12 text-stone-500">
        <p className="text-lg">Chưa có tài liệu nào</p>
        <p className="text-sm mt-2">Nhấn nút "Thêm tài liệu" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc: any) => {
        const Icon = getFileIcon(doc.file_type);
        
        return (
          <div
            key={doc.id}
            className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 truncate">{doc.title}</h3>
                  {doc.category && (
                    <span className="text-xs text-stone-500">
                      {doc.category.icon} {doc.category.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {doc.description && (
              <p className="text-sm text-stone-600 mb-3 line-clamp-2">{doc.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
              <span>{formatFileSize(doc.file_size)}</span>
              {doc.is_public ? (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">🌐 Công khai</span>
              ) : (
                <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded">🔒 Riêng tư</span>
              )}
            </div>

            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              <ExternalLink className="size-4" />
              Xem tài liệu
            </a>
          </div>
        );
      })}
    </div>
  );
}
