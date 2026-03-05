import { BookOpen, Construction, FileCheck, FileText, FolderOpen, Image, Plus, Shield, Upload, Video } from "lucide-react";
import Link from "next/link";

export default function AdminDocumentsPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-200/60">
              <Shield className="size-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                📚 Quản lý Tài liệu
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Admin Panel - Upload và phân loại tài liệu dòng họ
              </p>
            </div>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="size-5" />
            Upload tài liệu
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FolderOpen className="size-5 text-purple-600" />}
          label="Tổng tài liệu"
          value="0"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
        <StatCard
          icon={<FileText className="size-5 text-blue-600" />}
          label="PDF/Docs"
          value="0"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <StatCard
          icon={<Image className="size-5 text-green-600" />}
          label="Ảnh"
          value="0"
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
        <StatCard
          icon={<Video className="size-5 text-red-600" />}
          label="Video"
          value="0"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
      </div>

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200/60 shadow-sm p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white shadow-lg mb-6 border border-purple-100">
            <Construction className="size-12 text-purple-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Admin Panel đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Trang quản lý tài liệu sẽ bao gồm các chức năng sau:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              title="Upload tài liệu"
              description="Hỗ trợ PDF, DOC, ảnh, video (max 50MB)"
            />
            <FeatureItem
              title="Phân loại danh mục"
              description="Tổ chức theo thư mục và tags"
            />
            <FeatureItem
              title="Thumbnail tự động"
              description="Generate preview cho PDF và ảnh"
            />
            <FeatureItem
              title="Phân quyền truy cập"
              description="Public/Private cho từng tài liệu"
            />
            <FeatureItem
              title="Tìm kiếm full-text"
              description="Search nội dung và metadata"
            />
            <FeatureItem
              title="Version control"
              description="Quản lý nhiều phiên bản tài liệu"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/IMPLEMENTATION.md#documents-module"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-sm"
            >
              📖 Xem hướng dẫn triển khai
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-stone-700 font-semibold hover:bg-stone-50 transition-colors border border-stone-200"
            >
              ← Quay về Dashboard
            </Link>
          </div>

          <p className="text-sm text-stone-500 mt-8">
            📅 Dự kiến hoàn thành: Q4 2026 (Week 7-10)
          </p>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-purple-600" />
          Schema Database
        </h3>
        <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm text-stone-700 overflow-x-auto">
          <pre>{`CREATE TABLE document_categories (
  id          UUID PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  parent_id   UUID REFERENCES document_categories(id),
  icon        TEXT
);

CREATE TABLE documents (
  id            UUID PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  category_id   UUID REFERENCES document_categories(id),
  file_url      TEXT NOT NULL,
  file_type     TEXT,
  file_size     BIGINT,
  thumbnail_url TEXT,
  is_public     BOOLEAN DEFAULT FALSE,
  uploaded_by   UUID REFERENCES profiles(id)
);`}</pre>
        </div>
      </div>

      {/* Storage Structure */}
      <div className="mt-4 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <FolderOpen className="size-5 text-purple-600" />
          Cấu trúc Supabase Storage
        </h3>
        <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm text-stone-700">
          <pre>{`storage/documents/
├── genealogy/      # Gia phả
├── decrees/        # Sắc phong
├── steles/         # Văn bia
├── photos/         # Ảnh lịch sử
├── videos/         # Video sự kiện
└── research/       # Nghiên cứu`}</pre>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`p-4 rounded-xl ${bgColor} border ${borderColor}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="size-10 rounded-lg bg-white flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-stone-800">{value}</p>
          <p className="text-xs text-stone-600 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-stone-100">
      <div className="size-2 rounded-full bg-purple-500 mt-2 shrink-0"></div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
