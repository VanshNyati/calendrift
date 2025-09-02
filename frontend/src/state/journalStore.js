import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseSampleDate, toDayKey } from "../lib/date";

const mkId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

function buildDerived(entries) {
  const withParsed = entries.map((e) => ({
    ...e,
    _dateObj: e._dateObj || (e.dayKey ? null : parseSampleDate(e.date)),
    dayKey:
      e.dayKey ||
      (e._dateObj ? toDayKey(e._dateObj) : toDayKey(parseSampleDate(e.date))),
  }));
  const sorted = [...withParsed].sort((a, b) => {
    const da = a._dateObj || parseSampleDate(a.date);
    const db = b._dateObj || parseSampleDate(b.date);
    return da - db;
  });

  const byDay = {};
  for (const it of sorted) {
    const key = it.dayKey;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(it);
  }
  const indexById = {};
  sorted.forEach((e, i) => (indexById[e.id] = i));

  return { sorted, byDay, indexById };
}

export const useJournalStore = create(
  persist(
    (set, get) => ({
      entries: [], 
      sorted: [], 
      entriesByDay: {},  
      indexById: {}, 
      isModalOpen: false,
      activeIndex: 0,

      loadInitial(sample) {
        if (!Array.isArray(sample)) return;
        const withIds = sample.map((e) => ({ id: e.id || mkId(), ...e }));
        const { sorted, byDay, indexById } = buildDerived(withIds);
        set({ entries: withIds, sorted, entriesByDay: byDay, indexById });
      },

      addEntry(entry) {
        const next = [...get().entries, { id: mkId(), ...entry }];
        const { sorted, byDay, indexById } = buildDerived(next);
        set({ entries: next, sorted, entriesByDay: byDay, indexById });
      },

      editEntry(id, patch) {
        const next = get().entries.map((e) =>
          e.id === id ? { ...e, ...patch } : e
        );
        const { sorted, byDay, indexById } = buildDerived(next);
        set({ entries: next, sorted, entriesByDay: byDay, indexById });
      },

      deleteEntry(id) {
        const next = get().entries.filter((e) => e.id !== id);
        const { sorted, byDay, indexById } = buildDerived(next);
        set({ entries: next, sorted, entriesByDay: byDay, indexById });
      },

      openModalById(id) {
        const idx = get().indexById[id];
        if (idx != null) set({ isModalOpen: true, activeIndex: idx });
      },
      closeModal() {
        set({ isModalOpen: false });
      },
      goPrev() {
        set((s) => ({ activeIndex: Math.max(0, s.activeIndex - 1) }));
      },
      goNext() {
        set((s) => ({
          activeIndex: Math.min(s.sorted.length - 1, s.activeIndex + 1),
        }));
      },
      setActiveIndex(i) {
        set((s) => ({
          activeIndex: Math.min(Math.max(0, i), s.sorted.length - 1),
        }));
      },
    }),
    { name: "calendrift-journal-v1" }
  )
);
