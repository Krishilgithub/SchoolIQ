"use client";

import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  count: string;
  total: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  progressClass: string;
  bars: number[];
}

function StatItem({
  label,
  count,
  total,
  icon,
  colorClass,
  bgClass,
  progressClass,
  bars,
}: StatItemProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 flex flex-col justify-between h-[100px]",
        bgClass,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm",
              colorClass,
            )}
          >
            {icon}
          </div>
          <div>
            <p className="font-bold text-neutral-900 leading-none mb-1">
              {count}
              <span className="text-neutral-400 font-medium">/{total}</span>
            </p>
            <p className="text-xs font-medium text-neutral-500">{label}</p>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar (Barcode style) */}
      <div className="flex items-end gap-[2px] h-8 ml-auto">
        {bars.map((height, i) => (
          <div
            key={i}
            style={{ height: `${height}%` }}
            className={cn("w-1 rounded-sm opacity-80", progressClass)}
          />
        ))}
      </div>
    </div>
  );
}

export function AttendanceStats() {
  // Mock data for visual visualization
  const greenBars = [
    40, 60, 30, 80, 50, 90, 70, 40, 60, 80, 50, 90, 70, 40, 60, 30, 80, 50, 90,
    70,
  ];
  const orangeBars = [
    30, 40, 20, 50, 30, 60, 40, 30, 40, 50, 30, 60, 40, 30, 40, 20, 50, 30, 60,
    40,
  ];
  const purpleBars = [
    20, 30, 10, 40, 20, 50, 30, 20, 30, 40, 20, 50, 30, 20, 30, 10, 40, 20, 50,
    30,
  ];

  return (
    <div className="flex flex-col gap-4">
      <StatItem
        label="Attendance"
        count="23"
        total="24"
        icon={<Check className="h-4 w-4" />}
        colorClass="text-emerald-500"
        bgClass="bg-emerald-50 border border-emerald-100"
        progressClass="bg-emerald-400"
        bars={greenBars}
      />
      <StatItem
        label="Absences"
        count="1"
        total="24"
        icon={<X className="h-4 w-4" />}
        colorClass="text-orange-500"
        bgClass="bg-orange-50 border border-orange-100"
        progressClass="bg-orange-400"
        bars={orangeBars}
      />
      <StatItem
        label="Delayed"
        count="1"
        total="24"
        icon={<Clock className="h-4 w-4" />}
        colorClass="text-violet-500"
        bgClass="bg-violet-50 border border-violet-100"
        progressClass="bg-violet-400"
        bars={purpleBars}
      />
    </div>
  );
}
