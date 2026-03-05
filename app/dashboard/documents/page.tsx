import { BookOpen, Construction, FileText, FolderOpen, Image, Video } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
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

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200/60 shadow-sm p-8 sm:p-12">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white shadow-lg mb-6 border border-purple-100">
            <Construction className="size-12 text-purple-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Tính năng đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Module <span className="font-semibold text-purple-700">Kho tài liệu</span> sẽ giúp bạn:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              icon={<FileText className="size-5" />}
              title="Gia phả & Sắc phong"
              description="Số hóa tài liệu giấy, lưu trữ PDF"
            />
            <FeatureItem
              icon={<Image className="size-5" />}
              title="Ảnh lịch sử"
              description="Bộ sưu tập ảnh tổ tiên, nhà thờ họ"
            />
            <FeatureItem
              icon={<Video className="size-5" />}
              title="Video sự kiện"
              description="Lưu trữ video lễ giỗ, họp họ"
            />
            <FeatureItem
              icon={<FolderOpen className="size-5" />}
              title="Tìm kiếm & Phân loại"
              description="Tag hóa, full-text search"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/ROADMAP.md#4-kho-tài-liệu-dòng-họ"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-sm"
            >
              📖 Xem chi tiết Roadmap
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-stone-700 font-semibold hover:bg-stone-50 transition-colors border border-stone-200"
            >
              ← Quay về Dashboard
            </Link>
          </div>

          <p className="text-sm text-stone-500 mt-8">
            📅 Dự kiến triển khai: Q4 2026
          </p>
        </div>
      </div>

      {/* Document Categories */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          📁 Các loại tài liệu
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CategoryCard icon="📜" title="Gia phả" count="12" />
          <CategoryCard icon="🏛️" title="Sắc phong" count="5" />
          <CategoryCard icon="🗿" title="Văn bia" count="8" />
          <CategoryCard icon="📖" title="Nghiên cứu" count="15" />
          <CategoryCard icon="📸" title="Ảnh lịch sử" count="234" />
          <CategoryCard icon="🎬" title="Video" count="23" />
        </div>
      </div>
    </main>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-stone-100">
      <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}

function CategoryCard({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-stone-800">{title}</h4>
        <p className="text-xs text-stone-500">{count} tài liệu</p>
      </div>
    </div>
  );
}
