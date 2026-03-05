import { Construction, DollarSign, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

export default function FundsPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200/60">
            <PiggyBank className="size-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800">
            💰 Quỹ Họ & Quỹ Khuyến học
          </h1>
        </div>
        <p className="text-stone-600 text-lg">
          Quản lý tài chính minh bạch cho các hoạt động dòng họ
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/60 shadow-sm p-8 sm:p-12">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white shadow-lg mb-6 border border-emerald-100">
            <Construction className="size-12 text-emerald-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Tính năng đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Module <span className="font-semibold text-emerald-700">Quỹ Họ & Quỹ Khuyến học</span> sẽ bao gồm:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              icon={<Wallet className="size-5" />}
              title="Quỹ Họ"
              description="Tu sửa nhà thờ, tổ chức giỗ tổ, hỗ trợ người khó khăn"
            />
            <FeatureItem
              icon={<DollarSign className="size-5" />}
              title="Quỹ Khuyến học"
              description="Thưởng học sinh giỏi, hỗ trợ học phí, học bổng"
            />
            <FeatureItem
              icon={<TrendingUp className="size-5" />}
              title="Theo dõi giao dịch"
              description="Ghi nhận đóng góp và chi tiêu có chứng từ"
            />
            <FeatureItem
              icon={<PiggyBank className="size-5" />}
              title="Báo cáo tài chính"
              description="Minh bạch thu chi theo tháng/quý/năm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/ROADMAP.md#2-quỹ-họ--quỹ-khuyến-học"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
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

      {/* Fund Types Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="size-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800">Quỹ Họ</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Tu sửa, xây dựng nhà thờ họ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Tổ chức giỗ tổ, lễ khánh thành</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Hỗ trợ người khó khăn trong dòng họ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>In ấn gia phả, sách lịch sử</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <DollarSign className="size-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800">Quỹ Khuyến học</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Thưởng học sinh giỏi trong họ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Hỗ trợ học phí cho học sinh khó khăn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Học bổng du học</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Hỗ trợ nghiên cứu khoa học</span>
            </li>
          </ul>
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
      <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
