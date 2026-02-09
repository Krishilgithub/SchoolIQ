"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string; // For adding specific styles like gradients from bento grid
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-6 flex flex-col justify-between overflow-hidden relative",
        className,
      )}
    >
      <div className="flex items-center justify-between z-10">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
      </div>

      <div className="mt-4 z-10">
        <h3 className="text-3xl font-bold font-heading tracking-tight">
          {value}
        </h3>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                trend === "up"
                  ? "text-emerald-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-yellow-500",
              )}
            >
              {trend === "up" && <ArrowUp className="h-3 w-3 mr-0.5" />}
              {trend === "down" && <ArrowDown className="h-3 w-3 mr-0.5" />}
              {trend === "neutral" && <Minus className="h-3 w-3 mr-0.5" />}
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );
}
