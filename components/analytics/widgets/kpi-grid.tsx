"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";
import { KPIMetric } from "@/services/analytics/schemas";
import { AnalyticsService } from "@/services/analytics/mock-service";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function KPIGrid() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["analytics-kpi"],
    queryFn: AnalyticsService.getOverviewMetrics,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics?.map((metric) => (
        <Card key={metric.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.label}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {metric.trend === "up" ? (
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              ) : metric.trend === "down" ? (
                <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <Minus className="mr-1 h-3 w-3" />
              )}
              <span
                className={
                  metric.status === "positive"
                    ? "text-green-500 font-medium"
                    : metric.status === "negative"
                      ? "text-red-500 font-medium"
                      : ""
                }
              >
                {Math.abs(metric.change)}%
              </span>
              <span className="ml-1">from last term</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
