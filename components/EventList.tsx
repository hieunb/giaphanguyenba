'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Calendar, MapPin, Users, Edit2, X } from 'lucide-react';
import { deleteEvent, updateEvent } from '@/app/actions/events';

const EVENT_TYPE_LABELS: Record<string, string> = {
  ancestor_memorial: '🪔 Giỗ tổ',
  clan_meeting: '👥 Họp họ',
  inauguration: '🎊 Khánh thành',
  scholarship: '🎓 Khuyến học',
  wedding: '💒 Cưới hỏi',
  sports: '⚽ Thể thao',
  other: '📌 Khác',
};

export default function EventList({ events }: any) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
    setDeletingId(id);
    await deleteEvent(id);
    setDeletingId(null);
    router.refresh();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEvent) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateEvent(editingEvent.id, formData);

    if (result.error) {
      alert('Lỗi: ' + result.error);
    } else {
      setEditingEvent(null);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const formatDatetimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-stone-500">
        <p className="text-lg">Chưa có sự kiện nào</p>
        <p className="text-sm mt-2">Nhấn nút "Thêm sự kiện" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event: any) => {
        const startDate = new Date(event.start_date);
        const attendeeCount = event.attendees?.[0]?.count || 0;
        
        return (
          <div
            key={event.id}
            className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-stone-800">{event.title}</h3>
                  {event.is_lunar && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">🌙 Âm lịch</span>}
                </div>

                <div className="flex items-center flex-wrap gap-4 text-sm text-stone-600 mb-2">
                  <span className="flex items-center gap-1">
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {startDate.toLocaleDateString('vi-VN', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {event.location}
                    </span>
                  )}
                  {attendeeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="size-4" />
                      {attendeeCount} người tham dự
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-stone-600 text-sm mb-2">{event.description}</p>
                )}

                {event.recurrence && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-2">
                    🔄 Lặp lại: {event.recurrence === 'yearly' ? 'Hàng năm' : 'Hàng tháng'}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingEvent(event)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Sửa"
                >
                  <Edit2 className="size-4" />
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  title="Xóa"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-800">Sửa sự kiện</h2>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-2 hover:bg-stone-100 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Tên sự kiện *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingEvent.title}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Loại sự kiện *</label>
                <select
                  name="event_type"
                  required
                  defaultValue={editingEvent.event_type}
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
                    defaultValue={formatDatetimeLocal(editingEvent.start_date)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    defaultValue={formatDatetimeLocal(editingEvent.end_date)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingEvent.location || ''}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingEvent.description || ''}
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
                    defaultValue={editingEvent.max_attendees || ''}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Lặp lại</label>
                  <select
                    name="recurrence"
                    defaultValue={editingEvent.recurrence || ''}
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
                  defaultValue={editingEvent.image_url || ''}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_lunar"
                  value="true"
                  id="edit_is_lunar"
                  defaultChecked={editingEvent.is_lunar}
                  className="w-4 h-4 text-purple-600 border-stone-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="edit_is_lunar" className="text-sm font-medium text-stone-700">
                  🌙 Ngày âm lịch
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
