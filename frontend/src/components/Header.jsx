import { months } from "../lib/date";
import { useCalendarStore } from "../state/calendarStore";

export default function Header() {
  const headerMonth = useCalendarStore((s) => s.headerMonth);
  const headerYear = useCalendarStore((s) => s.headerYear);

  return (
    <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="text-lg font-semibold text-gray-900">
          {months[headerMonth]} {headerYear}
        </div>
      </div>
    </div>
  );
}
