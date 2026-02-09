"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = ["Jan", "Feb", "March", "April", "May", "June", "Jul"];

export function ExamCalendar() {
  const [activeMonth, setActiveMonth] = useState("Feb");

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-neutral-100">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Exam Calendar
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-neutral-200 text-neutral-600"
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filter
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
            1
          </span>
        </Button>
      </div>

      {/* Month Selector */}
      <div className="mb-8 flex items-center justify-between gap-2 overflow-x-auto pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-neutral-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center justify-center gap-2">
          {months.map((month) => (
            <button
              key={month}
              onClick={() => setActiveMonth(month)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                activeMonth === month
                  ? "bg-black text-white shadow-md transform scale-105"
                  : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100",
              )}
            >
              {month}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-neutral-400"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
            <div className="mb-3 flex items-start justify-between">
              <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-neutral-900 shadow-sm">
                302
              </span>
              <span className="text-xs font-medium text-neutral-500">
                Class 302
                <br />
                8:00 am
              </span>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-neutral-900">Math Exam</h4>
              <p className="text-xs text-neutral-500">Grade 12</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-indigo-100">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-neutral-700">
                  Confirmed
                </span>
              </div>
              <div className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600 shadow-sm border border-neutral-100">
                ID
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100">
            <div className="mb-3 flex items-start justify-between">
              <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-neutral-900 shadow-sm">
                305
              </span>
              <span className="text-xs font-medium text-neutral-500">
                Class 303
                <br />
                10:00 am
              </span>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-neutral-900">Physics Exam</h4>
              <p className="text-xs text-neutral-500">Grade 10</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-orange-100">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-neutral-700">
                  Confirmed
                </span>
              </div>
              <div className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600 shadow-sm border border-neutral-100">
                18
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-neutral-400 italic px-2">No exam</div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100">
            <div className="mb-2 flex items-start justify-between">
              <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-neutral-900 shadow-sm">
                304
              </span>
              <span className="text-xs font-medium text-neutral-500">
                8:00 am
              </span>
            </div>
            <h4 className="font-semibold text-neutral-900">Art Exam</h4>
            <div className="flex items-center justify-between mt-4 md:mt-8 pt-2 border-t border-rose-100">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-neutral-700">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
            <div className="mb-2 flex items-start justify-between">
              <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-neutral-900 shadow-sm">
                302
              </span>
              <span className="text-xs font-medium text-neutral-500">
                9:00 am
              </span>
            </div>
            <h4 className="font-semibold text-neutral-900">Math Exam</h4>
            <div className="flex items-center justify-between mt-4 md:mt-8 pt-2 border-t border-blue-100">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-neutral-700">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
            <div className="mb-2 flex items-start justify-between">
              <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-neutral-900 shadow-sm">
                305
              </span>
              <span className="text-xs font-medium text-neutral-500">
                10:00 am
              </span>
            </div>
            <h4 className="font-semibold text-neutral-900">English Exam</h4>
            <div className="flex items-center justify-between mt-4 md:mt-8 pt-2 border-t border-emerald-100">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-neutral-700">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
