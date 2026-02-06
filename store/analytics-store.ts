import { create } from "zustand";
import { AnalyticFilter } from "@/services/analytics/schemas";

interface AnalyticsState {
  filters: AnalyticFilter;
  setFilter: (key: keyof AnalyticFilter, value: string) => void;
  resetFilters: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  filters: {
    academicYear: "2023-2024",
    term: "Term 1",
    classId: "All",
    subjectId: "All",
  },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () =>
    set({
      filters: {
        academicYear: "2023-2024",
        term: "Term 1",
        classId: "All",
        subjectId: "All",
      },
    }),
}));
