"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageChartProps {
  usage: number; // percentage
  total: number; // in GB
}

export function StorageChart({ usage, total }: StorageChartProps) {
  const data = [
    { name: "Used", value: usage },
    { name: "Free", value: 100 - usage },
  ];

  // In a real app we'd use useTheme to get current theme colors for the 'Free' part
  // ensuring it looks good in dark mode too (e.g., slate-800)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-2 z-10">
        <h3 className="text-lg font-bold text-foreground font-heading">
          Storage Usage
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-[200px] relative z-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="cell-0" fill="hsl(var(--primary))" />
              <Cell key="cell-1" fill="hsl(var(--muted))" />
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ color: "#000" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-foreground font-heading">
            {usage}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">
            Used of {total}GB
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground font-medium">
            System
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <span className="text-xs text-muted-foreground font-medium">
            Available
          </span>
        </div>
      </div>
    </div>
  );
}
