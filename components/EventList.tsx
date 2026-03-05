'use client';

import { useState } from 'react';
import { Trash2, Calendar, MapPin, Users } from 'lucide-react';
import { deleteEvent } from '@/app/actions/events';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
    setDeletingId(id);
    await deleteEvent(id);
    setDeletingId(null);
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
        );
      })}
    </div>
  );
}
