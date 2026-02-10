import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendData } from "@/lib/types/dashboard";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: TrendData;
  subtitle?: string;
  color?: "blue" | "green" | "amber" | "purple" | "pink";
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-600",
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "blue",
}: MetricCardProps) {
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    trendColors[trend.direction],
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span>{trend.percentage}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", colorClasses[color])}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
