import { BookOpen, FileText, FolderOpen, Image, Video, File } from "lucide-react";
import { getDocuments, getDocumentCategories } from "@/app/actions/documents";

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const [documents, categories] = await Promise.all([
    getDocuments(),
    getDocumentCategories()
  ]);

  const stats = {
    total: documents?.length || 0,
    pdf: documents?.filter((d: any) => d.file_type?.includes('pdf'))?.length || 0,
    images: documents?.filter((d: any) => d.file_type?.includes('image'))?.length || 0,
    videos: documents?.filter((d: any) => d.file_type?.includes('video'))?.length || 0,
  };

  // Group by category
  const byCategory = documents?.reduce((acc: any, doc: any) => {
    const catName = doc.category?.name || 'Chưa phân loại';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(doc);
    return acc;
  }, {});

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return <FileText className="size-6 text-red-600" />;
    if (fileType?.includes('image')) return <Image className="size-6 text-green-600" />;
    if (fileType?.includes('video')) return <Video className="size-6 text-purple-600" />;
    return <File className="size-6 text-stone-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-200/60">
            <BookOpen className="size-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800">
            📚 Kho tài liệu dòng họ
          </h1>
        </div>
        <p className="text-stone-600 text-lg">
          Thư viện số lưu trữ và bảo tồn di sản văn hóa
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="size-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Tổng tài liệu</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="size-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">PDF/Docs</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.pdf}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Image className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Ảnh</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.images}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Video className="size-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Video</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.videos}</p>
        </div>
      </div>

      {/* Documents by Category */}
      {!documents || documents.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="size-16 text-stone-300 mx-auto mb-4" />
          <p className="text-lg text-stone-500">Chưa có tài liệu nào</p>
        </div>
      ) : (
        Object.keys(byCategory || {}).map(catName => (
          <div key={catName} className="mb-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
              <FolderOpen className="size-6 text-indigo-600" />
              {catName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {byCategory[catName].map((doc: any) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-stone-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 group-hover:bg-stone-200 transition-colors">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-800 truncate group-hover:text-indigo-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        {formatFileSize(doc.file_size)}
                      </p>
                    </div>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-stone-600 line-clamp-2 mb-2">{doc.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{doc.is_public ? '🌐 Công khai' : '🔒 Riêng tư'}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
