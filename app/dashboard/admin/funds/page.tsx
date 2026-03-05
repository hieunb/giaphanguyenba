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
