"use client";

import { PerformanceRadar } from "@/components/analytics/widgets/performance-radar";
import { GrowthChart } from "@/components/analytics/widgets/growth-chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PerformancePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Student Performance
          </h2>
          <p className="text-muted-foreground">
            Deep dive into individual and cohort metrics.
          </p>
        </div>

        <div className="w-[300px]">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Compare Student vs Cohort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top_10">Top 10%</SelectItem>
              <SelectItem value="class_avg">Class Average</SelectItem>
              <SelectItem value="risk_group">At-Risk Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PerformanceRadar />
        <GrowthChart />
      </div>
    </div>
  );
}
