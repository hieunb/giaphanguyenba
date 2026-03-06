'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, Link as LinkIcon, Save } from 'lucide-react';
import { createChronicle, updateChronicle, Chronicle } from '@/app/actions/chronicles';
import { createClient } from '@/utils/supabase/client';

interface ChronicleFormProps {
  editChronicle?: Chronicle | null;
  onClose?: () => void;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

export default function ChronicleForm({ editChronicle, onClose }: ChronicleFormProps) {
  const router = useRouter();
  const isEdit = !!editChronicle;

  const [isOpen, setIsOpen] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>(
    editChronicle?.cover_image_url ? 'url' : 'upload'
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    editChronicle?.cover_image_url || ''
  );
  const [slugValue, setSlugValue] = useState(editChronicle?.slug || '');
  const [titleValue, setTitleValue] = useState(editChronicle?.title || '');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitleValue(val);
    if (!isEdit || !slugValue) {
      setSlugValue(generateSlug(val));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      alert(`Ảnh quá lớn! Dung lượng tối đa là 10MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      e.target.value = '';
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    if (!supabase?.storage) throw new Error('Supabase client not initialized');
    const ext = file.name.split('.').pop();
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('chronicles')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('chronicles').getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Upload image if file selected
      if (imageMode === 'upload' && selectedImage) {
        const url = await uploadImage(selectedImage);
        if (!url) throw new Error('Không thể upload ảnh bìa');
        formData.set('cover_image_url', url);
      } else if (imageMode === 'url') {
        const urlVal = (form.querySelector('[name=cover_image_url_input]') as HTMLInputElement)?.value;
        formData.set('cover_image_url', urlVal || '');
      }

      let result;
      if (isEdit && editChronicle) {
        result = await updateChronicle(editChronicle.id, formData);
      } else {
        result = await createChronicle(formData);
      }

      if (result?.error) {
        alert('Lỗi: ' + result.error);
      } else {
        if (!isEdit) {
          setIsOpen(false);
          setTitleValue('');
          setSlugValue('');
          setSelectedImage(null);
          setImagePreview('');
          form.reset();
        }
        router.refresh();
        onClose?.();
      }
    } catch (err) {
      alert('Lỗi: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={titleValue}
          onChange={handleTitleChange}
          required
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Đường dẫn (slug)
        </label>
        <input
          type="text"
          name="slug"
          value={slugValue}
          onChange={(e) => setSlugValue(e.target.value)}
          placeholder="tu-dong-tao-tu-tieu-de"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
        />
        <p className="text-xs text-gray-400 mt-1">Để trống sẽ tự động tạo từ tiêu đề</p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
        <textarea
          name="excerpt"
          defaultValue={editChronicle?.excerpt || ''}
          rows={2}
          placeholder="Mô tả ngắn gọn về bài viết..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
        <textarea
          name="content"
          defaultValue={editChronicle?.content || ''}
          rows={10}
          placeholder="Viết nội dung bài gia phả ký... (hỗ trợ HTML)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y font-mono text-sm"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setImageMode('upload')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
              imageMode === 'upload'
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Upload size={14} /> Tải lên
          </button>
          <button
            type="button"
            onClick={() => setImageMode('url')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
              imageMode === 'url'
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LinkIcon size={14} /> URL
          </button>
        </div>

        {imageMode === 'upload' ? (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
        ) : (
          <input
            type="url"
            name="cover_image_url_input"
            defaultValue={editChronicle?.cover_image_url || ''}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        )}

        {imagePreview && (
          <div className="mt-2 relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="h-28 w-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => { setImagePreview(''); setSelectedImage(null); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <select
          name="status"
          defaultValue={editChronicle?.status || 'draft'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Đã xuất bản</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={() => { setIsOpen(false); onClose?.(); }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
        >
          <Save size={16} />
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bài viết'}
        </button>
      </div>
    </form>
  );

  if (isEdit) {
    return <div className="p-4">{formContent}</div>;
  }

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
        >
          <Plus size={16} />
          Tạo bài viết mới
        </button>
      ) : (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Tạo bài gia phả ký mới</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4">{formContent}</div>
        </div>
      )}
    </div>
  );
}
