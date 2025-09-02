import { create } from "zustand";
import { startOfTheMonth } from "../lib/date";

export const useCalendarStore = create((set) => ({
  anchorDate: startOfTheMonth(new Date()),
  weekStart: 0, // 0=Sun, 1=Mon
  headerMonth: new Date().getMonth(),
  headerYear: new Date().getFullYear(),

  setWeekStart(v) {
    set({ weekStart: Number(v) === 1 ? 1 : 0 });
  },
  setHeader(y, mIndex) {
    set({ headerYear: y, headerMonth: mIndex });
  }, // month index 0..11
}));
