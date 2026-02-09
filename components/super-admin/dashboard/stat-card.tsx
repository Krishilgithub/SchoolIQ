import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  className?: string;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  className,
  trend,
  trendUp,
  description,
  iconColor = "text-muted-foreground",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md group",
        className,
      )}
    >
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </p>
        <div
          className={cn(
            "p-2 rounded-lg bg-background border border-border group-hover:border-primary/20 transition-colors",
            iconColor,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </h3>
        {(trend || description) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "flex items-center font-medium",
                  trendUp ? "text-emerald-500" : "text-destructive",
                )}
              >
                {trendUp ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {trend}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </div>
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
        <Icon className={cn("h-24 w-24", iconColor)} />
      </div>
    </div>
  );
}
