'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Trash2, ExternalLink } from 'lucide-react';
import { deleteAchievement, toggleFeatured } from '@/app/actions/achievements';

const ACHIEVEMENT_TYPE_LABELS: Record<string, string> = {
  education: '🎓 Học tập',
  career: '💼 Nghề nghiệp',
  culture: '🎭 Văn hóa',
  sports: '⚽ Thể thao',
  social: '🤝 Xã hội',
  clan_contribution: '🏛️ Đóng góp dòng họ',
};

export default function AchievementList({ achievements, members }: any) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thành tích này?')) return;

    setDeletingId(id);
    const result = await deleteAchievement(id);

    if (result.error) {
      alert('Lỗi: ' + result.error);
    }

    setDeletingId(null);
    router.refresh();
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    await toggleFeatured(id, !currentStatus);
    router.refresh();
  };

  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-12 text-stone-500">
        <p className="text-lg">Chưa có thành tích nào</p>
        <p className="text-sm mt-2">Nhấn nút "Thêm thành tích" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement: any) => (
        <div
          key={achievement.id}
          className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {achievement.is_featured && (
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                )}
                <h3 className="font-bold text-lg text-stone-800">
                  {achievement.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-sm text-stone-600 mb-2">
                <span className="flex items-center gap-1">
                  👤 {achievement.member?.full_name || 'N/A'}
                </span>
                <span>
                  {ACHIEVEMENT_TYPE_LABELS[achievement.achievement_type] || achievement.achievement_type}
                </span>
                {achievement.year && (
                  <span>📅 {achievement.year}</span>
                )}
                {achievement.organization && (
                  <span>🏢 {achievement.organization}</span>
                )}
              </div>

              {achievement.description && (
                <p className="text-stone-600 text-sm mb-2">{achievement.description}</p>
              )}

              <div className="flex items-center gap-3 mt-3">
                {achievement.certificate_url && (
                  <a
                    href={achievement.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="size-3" />
                    Giấy chứng nhận
                  </a>
                )}
                {achievement.image_url && (
                  <a
                    href={achievement.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="size-3" />
                    Hình ảnh
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleToggleFeatured(achievement.id, achievement.is_featured)}
                className={`p-2 rounded-lg transition-colors ${
                  achievement.is_featured
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
                title={achievement.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
              >
                <Star className="size-4" />
              </button>

              <button
                onClick={() => handleDelete(achievement.id)}
                disabled={deletingId === achievement.id}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                title="Xóa"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
