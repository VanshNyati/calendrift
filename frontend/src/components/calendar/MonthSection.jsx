import { useEffect, useMemo, useRef } from "react";
import {
  buildMonthGrid,
  getDateNumber,
  isSameMonth,
  isToday,
  months,
  monthKey,
  toDayKey,
} from "../../lib/date";
import { useJournalStore } from "../../state/journalStore";
import JournalChip from "./JournalChip";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthSection({
  anchorDate,
  offset = 0,
  weekStart = 0,
  registerForHeader,
  showLocalTitle = false,
  ...rest
}) {
  const sectionRef = useRef(null);

  // Build the month grid data
  const monthData = useMemo(() => {
    return buildMonthGrid(anchorDate, offset, weekStart);
  }, [anchorDate, offset, weekStart]);

  const { year, monthIndex, firstOfTarget, cells } = monthData;

  // Register this section for header tracking
  useEffect(() => {
    if (!registerForHeader || !sectionRef.current) {
      return;
    }

    const key = monthKey(firstOfTarget);
    const getHeight = () => {
      return sectionRef.current?.offsetHeight || 0;
    };

    return registerForHeader(key, sectionRef, getHeight);
  }, [registerForHeader, firstOfTarget]);

  const getEntriesForDay = (date) => {
    const journalState = useJournalStore.getState();
    const entriesMap = journalState.entriesByDay;
    const dayKey = toDayKey(date);
    return entriesMap[dayKey] || [];
  };

  return (
    <section
      ref={sectionRef}
      {...rest}
      aria-label={`${months[monthIndex]} ${year}`}
      data-offset={offset}
      className="bg-white shadow-sm rounded-xl max-w-3xl mx-auto p-3"
    >
      {showLocalTitle && (
        <div className="text-sm font-semibold text-gray-700 px-2 py-1">
          {months[monthIndex]} {year}
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mt-1 px-1 text-[11px] font-medium text-gray-500">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px mt-1 bg-gray-200 rounded-lg overflow-hidden">
        {cells.map((cell) => {
          const isInCurrentMonth = isSameMonth(cell, firstOfTarget);
          const isCurrentDay = isToday(cell);
          const dayEntries = getEntriesForDay(cell);
          const hasMoreEntries = dayEntries.length > 3;

          let cellBgClass = "bg-white";
          if (!isInCurrentMonth) {
            cellBgClass = "bg-gray-50 text-gray-400";
          }

          let dayNumberClass = "text-gray-700";
          let dayNumberBg = "";
          if (isCurrentDay) {
            dayNumberClass = "text-white";
            dayNumberBg = "bg-indigo-600";
          }

          return (
            <div
              key={cell.getTime()}
              className={`relative p-2 min-h-20 sm:min-h-24 ${cellBgClass} ${
                isCurrentDay ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              {/* Day number */}
              <div className="text-xs">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${dayNumberBg} ${dayNumberClass}`}
                >
                  {getDateNumber(cell)}
                </span>
              </div>

              {/* Journal entries */}
              {dayEntries.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <JournalChip key={entry.id} entry={entry} />
                  ))}
                  {hasMoreEntries && (
                    <div className="text-[10px] text-gray-500">
                      +{dayEntries.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
