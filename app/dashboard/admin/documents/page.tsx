import { FileText, FolderOpen, Image, Video } from "lucide-react";
import { getDocuments, getDocumentCategories } from "@/app/actions/documents";
import DocumentForm from "@/components/DocumentForm";
import DocumentList from "@/components/DocumentList";

export const dynamic = 'force-dynamic';

export default async function AdminDocumentsPage() {
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

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-200/60">
              <FolderOpen className="size-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                📚 Quản lý Tài liệu
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Quản lý kho tài liệu lịch sử dòng họ
              </p>
            </div>
          </div>
          <DocumentForm categories={categories} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-white flex items-center justify-center">
              <FolderOpen className="size-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
              <p className="text-xs text-stone-600 font-medium">Tổng tài liệu</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-white flex items-center justify-center">
              <FileText className="size-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-stone-800">{stats.pdf}</p>
              <p className="text-xs text-stone-600 font-medium">PDF/Docs</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-white flex items-center justify-center">
              <Image className="size-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-stone-800">{stats.images}</p>
              <p className="text-xs text-stone-600 font-medium">Ảnh</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-white flex items-center justify-center">
              <Video className="size-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-stone-800">{stats.videos}</p>
              <p className="text-xs text-stone-600 font-medium">Video</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document List */}
      <DocumentList documents={documents} />
    </main>
  );
}
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-stone-100">
      <div className="size-2 rounded-full bg-purple-500 mt-2 shrink-0"></div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
