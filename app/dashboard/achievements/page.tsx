import { Award, Trophy, Star, Calendar } from "lucide-react";
import { getAchievements } from "@/app/actions/achievements";

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  // Split by featured and year
  const featured = achievements?.filter((a: any) => a.is_featured) || [];
  const byYear = achievements?.reduce((acc: any, a: any) => {
    const year = a.year || 'Không rõ năm';
    if (!acc[year]) acc[year] = [];
    acc[year].push(a);
    return acc;
  }, {});

  const years = Object.keys(byYear || {}).sort((a, b) => Number(b) - Number(a));

  const TYPE_LABELS: Record<string, string> = {
    education: '🎓 Học tập',
    career: '💼 Nghề nghiệp',
    culture: '🎭 Văn hóa',
    sports: '⚽ Thể thao',
    social: '🤝 Xã hội',
    clan_contribution: '🏛️ Đóng góp dòng họ',
  };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/60">
            <Trophy className="size-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800">
            🏆 Vinh danh thành tích
          </h1>
        </div>
        <p className="text-stone-600 text-lg">
          Ghi nhận và lan tỏa các thành tích của con cháu trong dòng họ
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="size-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Tổng thành tích</span>
          </div>
          <p className="text-3xl font-bold text-amber-900">{achievements?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-5 border border-yellow-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Star className="size-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Nổi bật</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{featured.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="size-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Năm nay</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {achievements?.filter((a: any) => a.year === new Date().getFullYear()).length || 0}
          </p>
        </div>
      </div>

      {/* Featured Achievements */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Star className="size-6 text-yellow-500 fill-yellow-500" />
            Thành tích nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((achievement: any) => (
              <AchievementCard key={achievement.id} achievement={achievement} typeLabels={TYPE_LABELS} featured />
            ))}
          </div>
        </div>
      )}

      {/* Achievements by Year */}
      {years.map(year => (
        <div key={year} className="mb-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Calendar className="size-6 text-blue-600" />
            {year}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {byYear[year].map((achievement: any) => (
              <AchievementCard key={achievement.id} achievement={achievement} typeLabels={TYPE_LABELS} />
            ))}
          </div>
        </div>
      ))}

      {!achievements || achievements.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="size-16 text-stone-300 mx-auto mb-4" />
          <p className="text-lg text-stone-500">Chưa có thành tích nào được ghi nhận</p>
        </div>
      )}
    </main>
  );
}

function AchievementCard({ achievement, typeLabels, featured }: any) {
  return (
    <div className={`border rounded-xl p-5 hover:shadow-lg transition-shadow ${featured ? 'border-yellow-300 bg-yellow-50/30' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Award className="size-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-stone-800 mb-2">{achievement.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 mb-2">
            <span className="flex items-center gap-1">
              👤 {achievement.member?.full_name || 'N/A'}
            </span>
            <span>{typeLabels[achievement.achievement_type] || achievement.achievement_type}</span>
            {achievement.year && <span>📅 {achievement.year}</span>}
            {achievement.organization && <span>🏢 {achievement.organization}</span>}
          </div>
          {achievement.description && (
            <p className="text-stone-600 text-sm">{achievement.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
