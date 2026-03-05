import { Wallet, DollarSign, PiggyBank, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getFunds, getFundTransactions } from "@/app/actions/funds";

export const dynamic = 'force-dynamic';

export default async function FundsPage() {
  const [funds, transactions] = await Promise.all([
    getFunds(),
    getFundTransactions()
  ]);

  const clanFund = funds?.find((f: any) => f.fund_type === 'clan_fund');
  const scholarshipFund = funds?.find((f: any) => f.fund_type === 'scholarship_fund');

  const thisYear = new Date().getFullYear();
  const yearTransactions = transactions?.filter((t: any) => {
    return new Date(t.transaction_date).getFullYear() === thisYear;
  });

  const yearIncome = yearTransactions?.filter((t: any) => t.transaction_type === 'donation')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
  const yearExpense = yearTransactions?.filter((t: any) => 
    ['expense', 'scholarship', 'support'].includes(t.transaction_type))
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

  const TYPE_LABELS: Record<string, string> = {
    donation: '💰 Đóng góp',
    expense: '💸 Chi tiêu',
    scholarship: '🎓 Học bổng',
    support: '🤝 Hỗ trợ',
  };

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

      {/* Fund Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200/60">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="size-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">Quỹ Họ</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-900">
            {Number(clanFund?.balance || 0).toLocaleString('vi-VN')} đ
          </p>
          <p className="text-sm text-emerald-700 mt-2">Tu sửa nhà thờ, tổ chức giỗ tổ, hỗ trợ hoàn cảnh khó khăn</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/60">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="size-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Quỹ Khuyến học</h3>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {Number(scholarshipFund?.balance || 0).toLocaleString('vi-VN')} đ
          </p>
          <p className="text-sm text-blue-700 mt-2">Thưởng học sinh giỏi, hỗ trợ học phí, cấp học bổng</p>
        </div>
      </div>

      {/* Year Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="size-5 text-purple-600" />
            <span className="text-sm font-medium text-stone-700">Giao dịch năm {thisYear}</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{yearTransactions?.length || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpCircle className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Tổng thu năm nay</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{yearIncome.toLocaleString('vi-VN')} đ</p>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownCircle className="size-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Tổng chi năm nay</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{yearExpense.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-4">Giao dịch gần đây</h2>
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <Wallet className="size-16 text-stone-300 mx-auto mb-4" />
            <p className="text-lg">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((trans: any) => (
              <div key={trans.id} className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{TYPE_LABELS[trans.transaction_type]}</span>
                      <span className={`text-lg font-bold ${trans.transaction_type === 'donation' ? 'text-green-600' : 'text-red-600'}`}>
                        {trans.transaction_type === 'donation' ? '+' : '-'}{Number(trans.amount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="text-sm text-stone-600 space-y-1">
                      <div>🏦 {trans.fund?.name || 'N/A'}</div>
                      {trans.member && <div>👤 {trans.member.full_name}</div>}
                      <div>📅 {new Date(trans.transaction_date).toLocaleDateString('vi-VN')}</div>
                      {trans.description && <div className="text-stone-500 mt-2">{trans.description}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
