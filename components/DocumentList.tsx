'use client';

import { useState } from 'react';
import { Trash2, ExternalLink, FileText, Image, Video, File, Brain, Check, Loader2 } from 'lucide-react';
import { deleteDocument } from '@/app/actions/documents';
import { useRouter } from 'next/navigation';

const FILE_ICONS: Record<string, any> = {
  pdf: FileText,
  image: Image,
  video: Video,
  default: File,
};

export default function DocumentList({ documents }: any) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    setDeletingId(id);
    await deleteDocument(id);
    setDeletingId(null);
    router.refresh();
  };

  const handleProcessAI = async (doc: any) => {
    const ext = doc.file_url?.split('.').pop()?.split('?')[0]?.toLowerCase();
    if (!['docx', 'txt'].includes(ext || '')) {
      alert(`Định dạng .${ext} chưa được hỗ trợ.\nHệ thống AI chỉ hỗ trợ .docx và .txt`);
      return;
    }
    setProcessingId(doc.id);
    try {
      const res = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id, fileUrl: doc.file_url, fileName: doc.title || doc.file_url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert('Lỗi xử lý AI: ' + data.error);
      } else {
        setProcessedIds(prev => new Set([...prev, doc.id]));
        alert(`✅ Đã xử lý xong! Tạo ${data.chunksCreated} đoạn văn bản.`);
      }
    } catch (e) {
      alert('Lỗi kết nối: ' + (e as Error).message);
    } finally {
      setProcessingId(null);
    }
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
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium mb-2"
            >
              <ExternalLink className="size-4" />
              Xem tài liệu
            </a>

            {/* AI Process button */}
            <button
              onClick={() => handleProcessAI(doc)}
              disabled={processingId === doc.id}
              className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                processedIds.has(doc.id)
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              } disabled:opacity-60`}
            >
              {processingId === doc.id ? (
                <><Loader2 className="size-4 animate-spin" /> Đang xử lý AI...</>
              ) : processedIds.has(doc.id) ? (
                <><Check className="size-4" /> Đã xử lý AI</>
              ) : (
                <><Brain className="size-4" /> Xử lý cho AI
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
