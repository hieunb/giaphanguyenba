'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createDocument, createCategory } from '@/app/actions/documents';

export default function DocumentForm({ categories }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createDocument(formData);

    if (result.error) {
      alert('Lỗi: ' + result.error);
    } else {
      setIsOpen(false);
      e.currentTarget.reset();
    }

    setIsSubmitting(false);
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);

    if (result.error) {
      alert('Lỗi: ' + result.error);
    } else {
      setShowCategoryForm(false);
      e.currentTarget.reset();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus className="size-5" />
        Thêm tài liệu
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Thêm tài liệu mới</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Tiêu đề tài liệu *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="VD: Gia phả họ Nguyễn Bá"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Danh mục
              <button
                type="button"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="ml-2 text-xs text-indigo-600 hover:text-indigo-700"
              >
                {showCategoryForm ? 'Hủy' : '+ Thêm danh mục mới'}
              </button>
            </label>
            
            {showCategoryForm ? (
              <div className="border border-indigo-200 rounded-lg p-3 mb-2 bg-indigo-50">
                <form onSubmit={handleCategorySubmit} className="space-y-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Tên danh mục"
                    required
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <input
                    type="text"
                    name="icon"
                    placeholder="Icon (emoji)"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <button type="submit" className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Lưu danh mục
                  </button>
                </form>
              </div>
            ) : null}

            <select
              name="category_id"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Không chọn --</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">URL file *</label>
            <input
              type="url"
              name="file_url"
              required
              placeholder="https://example.com/document.pdf"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Loại file</label>
              <input
                type="text"
                name="file_type"
                placeholder="VD: application/pdf"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Kích thước (bytes)</label>
              <input
                type="number"
                name="file_size"
                placeholder="1048576"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">URL thumbnail</label>
            <input
              type="url"
              name="thumbnail_url"
              placeholder="https://example.com/thumb.jpg"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Mô tả</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Mô tả tài liệu..."
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_public"
              value="true"
              id="is_public"
              defaultChecked
              className="w-4 h-4 text-indigo-600 border-stone-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-stone-700">
              🌐 Công khai (ai cũng xem được)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu tài liệu'}
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
