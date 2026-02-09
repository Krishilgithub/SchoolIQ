"use client";

import {
  MoreHorizontal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpcomingExams() {
  return (
    <div className="flex flex-col gap-6">
      {/* Mini Calendar Widget */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-neutral-100">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-neutral-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-neutral-900">
              February
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-neutral-400"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-neutral-500 h-8"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filter
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white">
              1
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
          {/* Headers */}
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div key={d} className="text-xs font-medium text-neutral-400">
              {d}
            </div>
          ))}

          {/* Dates */}
          {[...Array(35)].map((_, i) => {
            // Mock calendar logic for visual match
            if (i < 3) return <div key={i} className="h-8"></div>; // Empty start
            const date = i - 2;
            const isToday = date === 6;
            const hasDot = [6, 8, 12, 16, 20, 24, 28].includes(date);

            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div
                  className={`
                             h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                             ${isToday ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"}
                         `}
                >
                  {date}
                </div>
                {hasDot && (
                  <div
                    className={`h-1 w-1 rounded-full ${date < 8 ? "bg-red-400" : "bg-blue-400"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          Exams for this month
        </div>
      </div>

      {/* Upcoming Exams List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Upcoming exams</h3>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-neutral-500 h-8"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filter
          </Button>
        </div>

        <div className="space-y-3">
          {/* Math Exam Card */}
          <div className="rounded-xl bg-violet-100/50 p-4 border border-violet-100">
            <div className="flex items-start justify-between mb-1">
              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-neutral-900 shadow-sm">
                302
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-900 border border-neutral-100">
                4 Days left
              </span>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900">
              Math Exam
            </h4>
            <div className="flex items-end justify-between mt-1">
              <p className="text-[10px] text-neutral-500">
                10 Feb • 7:30am → 9:00am
              </p>
              <button className="text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* English Exam Card */}
          <div className="rounded-xl bg-emerald-100/50 p-4 border border-emerald-100">
            <div className="flex items-start justify-between mb-1">
              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-neutral-900 shadow-sm">
                303
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-900 border border-neutral-100">
                5 Days left
              </span>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900">
              English Exam
            </h4>
            <div className="flex items-end justify-between mt-1">
              <p className="text-[10px] text-neutral-500">
                11 Feb • 7:30am → 9:00am
              </p>
              <button className="text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
