'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { createEvent } from '@/app/actions/events';

export default function EventForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createEvent(formData);

    if (result.error) {
      alert('Lỗi: ' + result.error);
    } else {
      setIsOpen(false);
      e.currentTarget.reset();
      router.refresh();
    }

    setIsSubmitting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-sm"
      >
        <Plus className="size-5" />
        Thêm sự kiện
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Thêm sự kiện mới</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Tên sự kiện *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="VD: Lễ Giỗ Tổ năm 2026"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Loại sự kiện *</label>
            <select
              name="event_type"
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ancestor_memorial">🪔 Giỗ tổ</option>
              <option value="clan_meeting">👥 Họp họ</option>
              <option value="inauguration">🎊 Khánh thành</option>
              <option value="scholarship">🎓 Khuyến học</option>
              <option value="wedding">💒 Cưới hỏi</option>
              <option value="sports">⚽ Thể thao</option>
              <option value="other">📌 Khác</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Ngày bắt đầu *</label>
              <input
                type="datetime-local"
                name="start_date"
                required
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Ngày kết thúc</label>
              <input
                type="datetime-local"
                name="end_date"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Địa điểm</label>
            <input
              type="text"
              name="location"
              placeholder="VD: Nhà thờ họ Nguyễn Bá, Xã ABC"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Mô tả</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Mô tả chi tiết về sự kiện..."
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Số người tham dự tối đa</label>
              <input
                type="number"
                name="max_attendees"
                min="1"
                placeholder="Không giới hạn"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Lặp lại</label>
              <select
                name="recurrence"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Không lặp lại</option>
                <option value="yearly">Hàng năm</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">URL hình ảnh</label>
            <input
              type="url"
              name="image_url"
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_lunar"
              value="true"
              id="is_lunar"
              className="w-4 h-4 text-purple-600 border-stone-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_lunar" className="text-sm font-medium text-stone-700">
              🌙 Ngày âm lịch
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu sự kiện'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
