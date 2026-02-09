"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface GrowthChartProps {
  isLoading?: boolean;
}

export function GrowthChart({ isLoading }: GrowthChartProps) {
  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  const data = [
    { term: "Term 1", gpa: 3.2, avg: 3.0 },
    { term: "Term 2", gpa: 3.4, avg: 3.1 },
    { term: "Term 3", gpa: 3.8, avg: 3.2 },
    { term: "Term 4", gpa: 3.6, avg: 3.3 },
  ];

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>Academic Trajectory</CardTitle>
        <CardDescription>GPA Trend over terms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[300px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="term"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                dy={10}
              />
              <YAxis
                domain={[0, 4]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="gpa"
                stroke="#ea580c"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
