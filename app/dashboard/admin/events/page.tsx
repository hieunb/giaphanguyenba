import { Calendar, CalendarClock, CheckCircle, Clock, Construction, FileText, Plus, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function AdminEventsPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-200/60">
              <Shield className="size-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                📅 Quản lý Sự kiện
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Admin Panel - Tạo và quản lý lịch sự kiện dòng họ
              </p>
            </div>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="size-5" />
            Tạo sự kiện
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="size-5 text-blue-600" />}
          label="Tổng sự kiện"
          value="0"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <StatCard
          icon={<Clock className="size-5 text-orange-600" />}
          label="Sắp diễn ra"
          value="0"
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
        />
        <StatCard
          icon={<CheckCircle className="size-5 text-green-600" />}
          label="Đã hoàn thành"
          value="0"
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
        <StatCard
          icon={<Users className="size-5 text-purple-600" />}
          label="Tổng tham dự"
          value="0"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
      </div>

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/60 shadow-sm p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white shadow-lg mb-6 border border-blue-100">
            <Construction className="size-12 text-blue-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Admin Panel đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Trang quản lý sự kiện sẽ bao gồm các chức năng sau:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              title="Tạo sự kiện mới"
              description="Form đầy đủ với âm/dương lịch"
            />
            <FeatureItem
              title="Quản lý RSVP"
              description="Xem danh sách người tham dự"
            />
            <FeatureItem
              title="Upload ảnh sự kiện"
              description="Thêm ảnh sau khi sự kiện kết thúc"
            />
            <FeatureItem
              title="Sự kiện lặp lại"
              description="Thiết lập giỗ tổ hàng năm"
            />
            <FeatureItem
              title="Gửi thông báo"
              description="Nhắc lịch qua email/Zalo"
            />
            <FeatureItem
              title="Thống kê tham dự"
              description="Báo cáo số người tham gia"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/IMPLEMENTATION.md#events-module"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
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
            📅 Dự kiến hoàn thành: Q3 2026 (Week 5-8)
          </p>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-blue-600" />
          Schema Database
        </h3>
        <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm text-stone-700 overflow-x-auto">
          <pre>{`CREATE TABLE events (
  id            UUID PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  event_type    TEXT NOT NULL,
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ,
  location      TEXT,
  is_lunar      BOOLEAN DEFAULT FALSE,
  recurrence    TEXT,
  max_attendees INTEGER,
  created_by    UUID REFERENCES profiles(id)
);

CREATE TABLE event_attendees (
  id        UUID PRIMARY KEY,
  event_id  UUID REFERENCES events(id),
  member_id UUID REFERENCES persons(id),
  status    TEXT NOT NULL
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
      <div className="size-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
