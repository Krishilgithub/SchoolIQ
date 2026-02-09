import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: "violet" | "pink" | "orange";
}

export function StatsRow({ stats }: { stats: StatItemProps[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-foreground font-heading">
                {stat.value}
              </h3>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-opacity-10",
                {
                  "bg-violet-500/10 text-violet-500": stat.color === "violet",
                  "bg-pink-500/10 text-pink-500": stat.color === "pink",
                  "bg-orange-500/10 text-orange-500": stat.color === "orange",
                },
              )}
            >
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
          {stat.trend && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center text-xs font-medium",
                  stat.trendUp ? "text-emerald-500" : "text-red-500",
                )}
              >
                {stat.trendUp ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {stat.trend}
              </span>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
