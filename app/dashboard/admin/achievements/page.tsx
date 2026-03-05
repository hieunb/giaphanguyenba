import { Award, Calendar, Trophy, Star } from "lucide-react";
import { getAchievements } from "@/app/actions/achievements";
import { getAllMembers } from "@/app/actions/data";
import AchievementForm from "@/components/AchievementForm";
import AchievementList from "@/components/AchievementList";

export const dynamic = 'force-dynamic';

export default async function AdminAchievementsPage() {
  const [achievements, members] = await Promise.all([
    getAchievements(),
    getAllMembers()
  ]);

  const stats = {
    total: achievements?.length || 0,
    featured: achievements?.filter((a: any) => a.is_featured)?.length || 0,
    thisYear: achievements?.filter((a: any) => a.year === new Date().getFullYear())?.length || 0,
    byType: {
      education: achievements?.filter((a: any) => a.achievement_type === 'education')?.length || 0,
    }
  };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/60">
              <Trophy className="size-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                🏆 Quản lý Thành tích
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Thêm, sửa, xóa và phê duyệt thành tích của thành viên
              </p>
            </div>
          </div>
          <AchievementForm members={members} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="size-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Tổng thành tích</span>
          </div>
          <p className="text-3xl font-bold text-amber-900">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-5 border border-yellow-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Star className="size-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Nổi bật</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{stats.featured}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="size-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Năm nay</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.thisYear}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Award className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Học tập</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{stats.byType.education}</p>
        </div>
      </div>

      {/* Achievement List */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-4">Danh sách thành tích</h2>
        <AchievementList achievements={achievements} members={members} />
      </div>
    </main>
  );
}
