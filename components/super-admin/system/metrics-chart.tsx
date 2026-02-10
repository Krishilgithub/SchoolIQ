"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity } from "lucide-react";

interface MetricDataPoint {
  timestamp: string;
  api_latency: number;
  db_load: number;
  memory_usage: number;
  cpu_usage: number;
  error_rate: number;
}

interface MetricsChartProps {
  data: MetricDataPoint[];
  metric:
    | "api_latency"
    | "db_load"
    | "memory_usage"
    | "cpu_usage"
    | "error_rate";
  title: string;
  unit?: string;
  color?: string;
}

export function MetricsChart({
  data,
  metric,
  title,
  unit = "",
  color = "#8b5cf6",
}: MetricsChartProps) {
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTooltip = (value: number) => {
    return `${value.toFixed(2)}${unit}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined ? formatTooltip(value) : ""
              }
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
