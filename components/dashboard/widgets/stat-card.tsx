"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string; // e.g. "from last month"
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white p-6 shadow-sm border border-neutral-100 flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
          <h4 className="text-2xl font-bold text-neutral-900">{value}</h4>
        </div>
        {Icon && (
          <div className="rounded-full bg-neutral-50 p-2 text-neutral-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtext || trendValue) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trendValue && (
            <span
              className={cn(
                "font-medium px-1.5 py-0.5 rounded",
                trend === "up"
                  ? "bg-green-50 text-green-600"
                  : trend === "down"
                    ? "bg-red-50 text-red-600"
                    : "bg-neutral-50 text-neutral-600",
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {trendValue}
            </span>
          )}
          {subtext && <span className="text-neutral-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
