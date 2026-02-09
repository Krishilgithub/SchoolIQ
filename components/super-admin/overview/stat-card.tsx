"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  index?: number;
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  index = 0,
  href,
}: StatCardProps & { href?: string }) {
  const CardContent = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md border-slate-200/60 bg-white",
        href &&
          "cursor-pointer hover:border-indigo-200 hover:shadow-indigo-100",
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "p-2 rounded-lg bg-slate-50 text-slate-500",
              index === 0 && "bg-indigo-50 text-indigo-600",
              index === 1 && "bg-blue-50 text-blue-600",
              index === 2 && "bg-emerald-50 text-emerald-600",
              index === 3 && "bg-orange-50 text-orange-600",
              index === 4 && "bg-rose-50 text-rose-600",
            )}
          >
            {icon}
          </div>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                trend === "up"
                  ? "bg-emerald-50 text-emerald-600"
                  : trend === "down"
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-50 text-slate-600",
              )}
            >
              {trend === "up" && <ArrowUp className="h-3 w-3" />}
              {trend === "down" && <ArrowDown className="h-3 w-3" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none scale-150 transform rotate-12 text-current">
          {/* We could duplicate the icon here for a watermark effect if we passed a component class */}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}
