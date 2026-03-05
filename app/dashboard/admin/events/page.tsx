import { Calendar, Clock, CheckCircle, Users } from "lucide-react";
import { getEvents } from "@/app/actions/events";
import EventForm from "@/components/EventForm";
import EventList from "@/components/EventList";

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const events = await getEvents();

  const now = new Date();
  const upcoming = events?.filter((e: any) => new Date(e.start_date) > now) || [];
  const completed = events?.filter((e: any) => new Date(e.start_date) <= now) || [];
  const totalAttendees = events?.reduce((sum: number, e: any) => sum + (e.attendees?.[0]?.count || 0), 0) || 0;

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-200/60">
              <Calendar className="size-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                📅 Quản lý Sự kiện
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Tạo và quản lý lịch sự kiện dòng họ
              </p>
            </div>
          </div>
          <EventForm />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="size-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Tổng sự kiện</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">{events?.length || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="size-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Sắp diễn ra</span>
          </div>
          <p className="text-3xl font-bold text-orange-900">{upcoming.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/60">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Đã hoàn thành</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{completed.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/60">
          <div className="flex items-center gap-3 mb-2">
            <Users className="size-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Người tham dự</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{totalAttendees}</p>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-4">Danh sách sự kiện</h2>
        <EventList events={events} />
      </div>
    </main>
  );
}
