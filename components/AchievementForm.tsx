'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createAchievement } from '@/app/actions/achievements';

interface Member {
  id: string;
  full_name: string;
}

export default function AchievementForm({ members }: { members: Member[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createAchievement(formData);

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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-sm"
      >
        <Plus className="size-5" />
        Thêm thành tích
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Thêm thành tích mới</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Thành viên *
            </label>
            <select
              name="member_id"
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">-- Chọn thành viên --</option>
              {members?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tiêu đề thành tích *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="VD: Giải nhất Olympic Toán quốc gia"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Loại thành tích *
            </label>
            <select
              name="achievement_type"
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="education">🎓 Học tập</option>
              <option value="career">💼 Nghề nghiệp</option>
              <option value="culture">🎭 Văn hóa</option>
              <option value="sports">⚽ Thể thao</option>
              <option value="social">🤝 Xã hội</option>
              <option value="clan_contribution">🏛️ Đóng góp dòng họ</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Năm
              </label>
              <input
                type="number"
                name="year"
                min="1900"
                max={new Date().getFullYear()}
                defaultValue={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Tổ chức trao giải
              </label>
              <input
                type="text"
                name="organization"
                placeholder="VD: Bộ Giáo dục"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Mô tả chi tiết về thành tích..."
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              URL hình ảnh
            </label>
            <input
              type="url"
              name="image_url"
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              URL giấy chứng nhận
            </label>
            <input
              type="url"
              name="certificate_url"
              placeholder="https://example.com/certificate.pdf"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured"
              value="true"
              id="is_featured"
              className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-stone-700">
              ⭐ Đánh dấu là thành tích nổi bật
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thành tích'}
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
