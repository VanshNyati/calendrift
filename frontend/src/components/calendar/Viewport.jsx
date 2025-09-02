import { useCallback, useEffect, useRef } from "react";
import MonthSection from "./MonthSection";
import { useInfiniteWindow } from "../../hooks/useInfiniteWindow";
import { useHeaderMonth } from "../../hooks/useHeaderMonth";
import { useCalendarStore } from "../../state/calendarStore";

const SCROLL_STORAGE_KEY = "calendrift:scrollState:v2";

// Helper function to calculate difference between two months
function calculateMonthDifference(year1, month1, year2, month2) {
  return (year1 - year2) * 12 + (month1 - month2);
}

export default function Viewport() {
  const containerRef = useRef(null);
  const hasInitializedScroll = useRef(false);

  // Get infinite scroll data
  const infiniteData = useInfiniteWindow(containerRef);
  const monthOffsets = infiniteData.months;
  const topSentinel = infiniteData.topRef;
  const bottomSentinel = infiniteData.bottomRef;

  // Get calendar state
  const anchorDate = useCalendarStore((s) => s.anchorDate);
  const weekStart = useCalendarStore((s) => s.weekStart);
  const setHeaderInfo = useCalendarStore((s) => s.setHeader);

  // Handle header month changes
  const handleHeaderChange = useCallback(
    (year, monthIndex0) => {
      setHeaderInfo(year, monthIndex0);
    },
    [setHeaderInfo]
  );

  const headerHook = useHeaderMonth({
    containerRef,
    onChange: handleHeaderChange,
  });

  // Initialize scroll position on first load
  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasInitializedScroll.current) {
      return;
    }

    // Clean up old scroll key if it exists
    if (localStorage.getItem("calendrift-scroll") !== null) {
      localStorage.removeItem("calendrift-scroll");
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let scrollRestored = false;

    // Try to restore previous scroll position
    try {
      const savedScrollData = localStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedScrollData) {
        const parsed = JSON.parse(savedScrollData);
        if (parsed && typeof parsed.scrollTop === "number") {
          // Only restore if the saved position is within 2 months of current
          const monthDiff = Math.abs(
            calculateMonthDifference(
              parsed.y || currentYear,
              parsed.m || currentMonth,
              currentYear,
              currentMonth
            )
          );

          if (monthDiff <= 2) {
            container.scrollTop = parsed.scrollTop;
            scrollRestored = true;
          }
        }
      }
    } catch (error) {
      // Ignore JSON parsing errors
      console.warn("Failed to parse saved scroll position");
    }

    // If we couldn't restore, scroll to current month
    if (!scrollRestored) {
      requestAnimationFrame(() => {
        const currentMonthElement =
          container.querySelector('[data-offset="0"]');
        if (currentMonthElement) {
          const headerHeight = 52; // Fixed header height
          const scrollPosition =
            currentMonthElement.offsetTop - headerHeight - 8;
          container.scrollTo({
            top: scrollPosition,
            behavior: "auto",
          });
        }
      });
    }

    hasInitializedScroll.current = true;

    // Set up scroll position saving
    const saveScrollPosition = () => {
      const calendarState = useCalendarStore.getState();
      const scrollData = {
        scrollTop: container.scrollTop,
        y: calendarState.headerYear,
        m: calendarState.headerMonth,
        ts: Date.now(),
      };
      localStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(scrollData));
    };

    container.addEventListener("scroll", saveScrollPosition);

    return () => {
      container.removeEventListener("scroll", saveScrollPosition);
    };
  }, [monthOffsets.length]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto bg-gray-50 h-[calc(100vh-52px)]"
    >
      <div className="max-w-3xl mx-auto p-3 space-y-6">
        <div ref={topSentinel} />
        {monthOffsets.map((offset) => (
          <MonthSection
            key={offset}
            data-offset={offset}
            anchorDate={anchorDate}
            offset={offset}
            weekStart={weekStart}
            registerForHeader={headerHook.register}
          />
        ))}
        <div ref={bottomSentinel} />
      </div>
    </div>
  );
}
