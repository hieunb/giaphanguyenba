'use client';

import { Trash2, ExternalLink } from 'lucide-react';
import { deleteFundTransaction } from '@/app/actions/funds';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPE_LABELS: Record<string, string> = {
  donation: '💰 Đóng góp',
  expense: '💸 Chi tiêu',
  scholarship: '🎓 Học bổng',
  support: '🤝 Hỗ trợ',
};

export default function TransactionList({ transactions }: any) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    setDeletingId(id);
    await deleteFundTransaction(id);
    setDeletingId(null);
    router.refresh();
  };

  if (!transactions || transactions.length === 0) {
    return <div className="text-center py-12 text-stone-500"><p>Chưa có giao dịch nào</p></div>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((trans: any) => (
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
                {trans.receipt_url && (
                  <a href={trans.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-2">
                    <ExternalLink className="size-3" />Xem biên lai
                  </a>
                )}
              </div>
            </div>
            <button onClick={() => handleDelete(trans.id)} disabled={deletingId === trans.id} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
