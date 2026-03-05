import { DashboardProvider } from "@/components/DashboardContext";
import EventsList from "@/components/EventsList";
import MemberDetailModal from "@/components/MemberDetailModal";
import { getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Sự kiện gia phả",
};

export default async function EventsPage() {
  const supabase = await getSupabase();

  const [personsRes, customEventsRes, eventsRes] = await Promise.all([
    supabase
      .from("persons")
      .select(
        "id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, is_deceased, avatar_url",
      ),
    supabase
      .from("custom_events")
      .select("id, name, content, event_date, location, created_by"),
    supabase
      .from("events")
      .select("id, title, description, start_date, location")
      .order('start_date', { ascending: true }),
  ]);

  const persons = personsRes.data || [];
  const customEvents = customEventsRes.data || [];
  const events = eventsRes.data || [];

  // Convert admin events to custom events format for compatibility
  const adminEventsAsCustom = events.map((e: any) => ({
    id: e.id,
    name: e.title,
    content: e.description,
    event_date: e.start_date.split('T')[0], // Convert datetime to date
    location: e.location,
    created_by: null, // Admin events don't have individual creators
  }));

  // Merge both types of events
  const allCustomEvents = [...customEvents, ...adminEventsAsCustom];

  return (
    <DashboardProvider>
      <div className="flex-1 w-full relative flex flex-col pb-12">
        <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <h1 className="title">Sự kiện gia phả</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Sinh nhật, ngày giỗ (âm lịch) và các sự kiện tuỳ chỉnh
          </p>
        </div>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
          <EventsList
            persons={persons ?? []}
            customEvents={allCustomEvents ?? []}
          />
        </main>
      </div>

      {/* Modal for member details when clicking an event card */}
      <MemberDetailModal />
    </DashboardProvider>
  );
}
