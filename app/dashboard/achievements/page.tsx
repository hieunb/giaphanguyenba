import { Award, Construction, Star, Trophy } from "lucide-react";
import Link from "next/link";

export default function AchievementsPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/60">
            <Trophy className="size-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800">
            🏆 Vinh danh thành tích
          </h1>
        </div>
        <p className="text-stone-600 text-lg">
          Ghi nhận và lan tỏa các thành tích của con cháu trong dòng họ
        </p>
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
            Tính năng đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Module <span className="font-semibold text-amber-700">Vinh danh thành tích</span> sẽ cho phép bạn:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              icon={<Star className="size-5" />}
              title="Ghi nhận thành tích"
              description="Học tập, khoa bảng, nghề nghiệp, văn hóa, thể thao"
            />
            <FeatureItem
              icon={<Award className="size-5" />}
              title="Bảng vàng dòng họ"
              description="Hiển thị thành tích nổi bật theo năm"
            />
            <FeatureItem
              icon={<Trophy className="size-5" />}
              title="Upload chứng chỉ"
              description="Lưu trữ ảnh, chứng chỉ minh chứng"
            />
            <FeatureItem
              icon={<Star className="size-5" />}
              title="Xuất báo cáo"
              description="Export PDF bảng vàng thành tích"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/ROADMAP.md#1-vinh-danh-thành-tích-honorachievement"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-sm"
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
            📅 Dự kiến triển khai: Q3 2026
          </p>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          📅 Lộ trình phát triển
        </h3>
        <div className="space-y-3 text-sm text-stone-600">
          <div className="flex items-start gap-3">
            <div className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
            <div>
              <span className="font-semibold">Week 1-2:</span> Database schema & Backend API
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-2 rounded-full bg-stone-300 mt-1.5 shrink-0"></div>
            <div>
              <span className="font-semibold">Week 3-4:</span> Frontend UI & Integration
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-2 rounded-full bg-stone-300 mt-1.5 shrink-0"></div>
            <div>
              <span className="font-semibold">Week 5:</span> Testing & Polish
            </div>
          </div>
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
      <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
