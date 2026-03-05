'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createFundTransaction } from '@/app/actions/funds';

export default function FundTransactionForm({ funds, members }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createFundTransaction(formData);

    if (result.error) {
      alert('Lỗi: ' + result.error);
    } else {
      setIsOpen(false);
      e.currentTarget.reset();
    }

    setIsSubmitting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <Plus className="size-5" />
        Thêm giao dịch
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Thêm giao dịch mới</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Quỹ *</label>
            <select name="fund_id" required className="w-full px-4 py-2 border border-stone-300 rounded-lg">
              <option value="">-- Chọn quỹ --</option>
              {funds?.map((fund: any) => (
                <option key={fund.id} value={fund.id}>{fund.name} (Số dư: {Number(fund.balance).toLocaleString('vi-VN')} đ)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Loại giao dịch *</label>
            <select name="transaction_type" required className="w-full px-4 py-2 border border-stone-300 rounded-lg">
              <option value="donation">💰 Đóng góp</option>
              <option value="expense">💸 Chi tiêu</option>
              <option value="scholarship">🎓 Học bổng</option>
              <option value="support">🤝 Hỗ trợ</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Số tiền * </label>
              <input type="number" name="amount" required step="0.01" placeholder="1000000" className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Ngày giao dịch *</label>
              <input type="date" name="transaction_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Thành viên (nếu có)</label>
            <select name="member_id" className="w-full px-4 py-2 border border-stone-300 rounded-lg">
              <option value="">-- Không chọn --</option>
              {members?.map((member: any) => (
                <option key={member.id} value={member.id}>{member.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Mô tả</label>
            <textarea name="description" rows={3} placeholder="VD: Đóng góp đầu xuân 2026" className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">URL biên lai/chứng từ</label>
            <input type="url" name="receipt_url" placeholder="https://example.com/receipt.pdf" className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50">
              {isSubmitting ? 'Đang lưu...' : 'Lưu giao dịch'}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}
