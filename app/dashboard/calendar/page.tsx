import { getMockWeekSchedule } from '@/lib/mock-data/calendar';
import { CalendarBoard } from '@/components/dashboard/calendar/calendar-board';

export default function CalendarPage() {
  const weeklySchedule = getMockWeekSchedule();

  return (
    <div className="flex flex-col h-full relative min-h-screen">
      {/* Header — sits flush on the dark page, no border box */}
      <div className="flex-none px-8 pt-8 pb-6">
        <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tighter text-white mb-1.5">
          Content Calendar
        </h1>
        <p className="text-white/40 text-sm font-light">
          Overview of scheduled campaigns and posts for the current week.
        </p>
      </div>

      {/* Kanban Board */}
      <CalendarBoard initialSchedule={weeklySchedule} />
    </div>
  );
}
