import { Award, Construction, FileText, Plus, Search, Shield, Star, Trophy } from "lucide-react";
import Link from "next/link";

export default function AdminAchievementsPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/60">
              <Shield className="size-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                🏆 Quản lý Thành tích
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Admin Panel - Thêm, sửa, xóa và phê duyệt thành tích
              </p>
            </div>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Plus className="size-5" />
            Thêm thành tích
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Trophy className="size-5 text-amber-600" />}
          label="Tổng thành tích"
          value="0"
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
        />
        <StatCard
          icon={<Star className="size-5 text-yellow-600" />}
          label="Nổi bật"
          value="0"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
        />
        <StatCard
          icon={<Award className="size-5 text-blue-600" />}
          label="Chờ phê duyệt"
          value="0"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <StatCard
          icon={<FileText className="size-5 text-green-600" />}
          label="Năm nay"
          value="0"
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
      </div>

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200/60 shadow-sm p-8 sm:p-12">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white shadow-lg mb-6 border border-amber-100">
            <Construction className="size-12 text-amber-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Admin Panel đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Trang quản lý thành tích sẽ bao gồm các chức năng sau:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              title="Thêm thành tích mới"
              description="Form nhập đầy đủ thông tin với validation"
            />
            <FeatureItem
              title="Phê duyệt thành tích"
              description="Xác minh và kích hoạt thành tích"
            />
            <FeatureItem
              title="Upload chứng chỉ"
              description="Quản lý file ảnh và tài liệu minh chứng"
            />
            <FeatureItem
              title="Đánh dấu nổi bật"
              description="Chọn thành tích hiển thị trang chủ"
            />
            <FeatureItem
              title="Lọc và tìm kiếm"
              description="Tìm theo tên, năm, loại thành tích"
            />
            <FeatureItem
              title="Xuất báo cáo"
              description="Export PDF bảng vàng theo năm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/IMPLEMENTATION.md#achievements-module"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-sm"
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
            📅 Dự kiến hoàn thành: Q3 2026 (Week 1-4)
          </p>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-amber-600" />
          Schema Database
        </h3>
        <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm text-stone-700 overflow-x-auto">
          <pre>{`CREATE TABLE achievements (
  id              UUID PRIMARY KEY,
  member_id       UUID REFERENCES persons(id),
  title           TEXT NOT NULL,
  description     TEXT,
  achievement_type TEXT NOT NULL,
  year            INTEGER,
  organization    TEXT,
  certificate_url TEXT,
  image_url       TEXT,
  is_featured     BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
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
      <div className="size-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
