'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { createDocument, createCategory } from '@/app/actions/documents';
import { createClient } from '@/utils/supabase/client';

export default function DocumentForm({ categories }: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (50MB max)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert(`File quá lớn! Dung lượng tối đa là 50MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      
      // Validate client
      if (!supabase || !supabase.storage) {
        throw new Error('Supabase client not initialized properly');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message || 'Upload failed');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;

    try {
      const formData = new FormData(form);

      // If upload mode and file selected, upload first
      if (uploadMode === 'file' && selectedFile) {
        setUploadProgress(10);
        const fileUrl = await uploadFile(selectedFile);
        
        if (!fileUrl) {
          alert('Lỗi: Không thể upload file. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }

        setUploadProgress(80);
        
        // Set file metadata
        formData.set('file_url', fileUrl);
        formData.set('file_type', selectedFile.type);
        formData.set('file_size', selectedFile.size.toString());
      }

      setUploadProgress(90);
      const result = await createDocument(formData);

      if (result.error) {
        alert('Lỗi: ' + result.error);
      } else {
        const title = formData.get('title') as string;
        setIsOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
        form.reset();
        router.refresh();
        setSuccessMsg(`✅ Đã thêm tài liệu "${title}" thành công!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Lỗi: ' + (error as Error).message);
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
      <>
        {successMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="size-5" />
          Thêm tài liệu
        </button>
      </>
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

          {/* Upload Mode Toggle */}
          <div className="flex gap-2 p-1 bg-stone-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                uploadMode === 'file'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <Upload className="size-4" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                uploadMode === 'url'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <LinkIcon className="size-4" />
              Nhập URL
            </button>
          </div>

          {/* File Upload */}
          {uploadMode === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Chọn file *</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-stone-600">
                  <p>📄 {selectedFile.name}</p>
                  <p>📊 {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p>🏷️ {selectedFile.type || 'Unknown type'}</p>
                </div>
              )}
            </div>
          ) : (
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
          )}

          {/* File Type and Size (only for URL mode) */}
          {uploadMode === 'url' && (
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
          )}

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

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Đang tải lên...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting 
                ? (uploadProgress > 0 ? `Đang upload ${uploadProgress}%...` : 'Đang lưu...') 
                : 'Lưu tài liệu'}
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
