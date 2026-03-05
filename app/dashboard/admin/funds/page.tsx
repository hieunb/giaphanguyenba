import { ArrowDownCircle, ArrowUpCircle, Wallet, DollarSign } from "lucide-react";
import { getFunds, getFundTransactions } from "@/app/actions/funds";
import { getAllMembers } from "@/app/actions/data";
import FundTransactionForm from "@/components/FundTransactionForm";
import TransactionList from "@/components/TransactionList";

export const dynamic = 'force-dynamic';

export default async function AdminFundsPage() {
  const [funds, transactions, members] = await Promise.all([
    getFunds(),
    getFundTransactions(),
    getAllMembers()
  ]);

  const clanFund = funds?.find((f: any) => f.fund_type === 'clan_fund');
  const scholarshipFund = funds?.find((f: any) => f.fund_type === 'scholarship_fund');

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthTransactions = transactions?.filter((t: any) => {
    const date = new Date(t.transaction_date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const income = thisMonthTransactions?.filter((t: any) => t.transaction_type === 'donation').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
  const expense = thisMonthTransactions?.filter((t: any) => t.transaction_type === 'expense' || t.transaction_type === 'scholarship' || t.transaction_type === 'support').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200/60">
              <Wallet className="size-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                💰 Quản lý Quỹ Họ
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Quản lý giao dịch và báo cáo tài chính
              </p>
            </div>
          </div>
          <FundTransactionForm funds={funds} members={members} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="size-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">Quỹ Họ</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{Number(clanFund?.balance || 0).toLocaleString('vi-VN')} đ</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/60">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="size-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Quỹ Khuyến học</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{Number(scholarshipFund?.balance || 0).toLocaleString('vi-VN')} đ</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/60">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpCircle className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Thu tháng này</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{income.toLocaleString('vi-VN')} đ</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/60">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownCircle className="size-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Chi tháng này</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{expense.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-4">Lịch sử giao dịch</h2>
        <TransactionList transactions={transactions} />
      </div>
    </main>
  );
}
      </div>

      {/* Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/60 shadow-sm p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white shadow-lg mb-6 border border-emerald-100">
            <Construction className="size-12 text-emerald-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
            Admin Panel đang phát triển
          </h2>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Trang quản lý quỹ sẽ bao gồm các chức năng sau:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <FeatureItem
              title="Ghi nhận đóng góp"
              description="Thêm giao dịch thu với biên lai"
            />
            <FeatureItem
              title="Quản lý chi tiêu"
              description="Ghi nhận chi với chứng từ đầy đủ"
            />
            <FeatureItem
              title="Báo cáo tài chính"
              description="Tổng hợp thu chi theo tháng/quý/năm"
            />
            <FeatureItem
              title="Xuất báo cáo"
              description="Export Excel/PDF báo cáo minh bạch"
            />
            <FeatureItem
              title="Lịch sử giao dịch"
              description="Xem và tìm kiếm các giao dịch"
            />
            <FeatureItem
              title="Thống kê trực quan"
              description="Dashboard với biểu đồ thu chi"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/IMPLEMENTATION.md#funds-module"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
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
            📅 Dự kiến hoàn thành: Q4 2026 (Week 1-6)
          </p>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-emerald-600" />
          Schema Database
        </h3>
        <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm text-stone-700 overflow-x-auto">
          <pre>{`CREATE TABLE funds (
  id          UUID PRIMARY KEY,
  name        TEXT NOT NULL,
  fund_type   TEXT NOT NULL,
  balance     DECIMAL(15,2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fund_transactions (
  id               UUID PRIMARY KEY,
  fund_id          UUID REFERENCES funds(id),
  member_id        UUID REFERENCES persons(id),
  amount           DECIMAL(15,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  description      TEXT,
  receipt_url      TEXT,
  transaction_date DATE NOT NULL,
  recorded_by      UUID REFERENCES profiles(id)
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
      <div className="size-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
      <div>
        <h4 className="font-semibold text-stone-800 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  );
}
