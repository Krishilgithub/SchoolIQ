"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceRadarProps {
  data?: any[];
  isLoading?: boolean;
}

export function PerformanceRadar({ data, isLoading }: PerformanceRadarProps) {
  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  const mockData = data || [
    { subject: "Math", student: 120, average: 110, fullMark: 150 },
    { subject: "Chinese", student: 98, average: 130, fullMark: 150 },
    { subject: "English", student: 86, average: 130, fullMark: 150 },
    { subject: "Geography", student: 99, average: 100, fullMark: 150 },
    { subject: "Physics", student: 85, average: 90, fullMark: 150 },
    { subject: "History", student: 65, average: 85, fullMark: 150 },
  ];

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>Subject Mastery</CardTitle>
        <CardDescription>Comparing student vs class average</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[300px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 150]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Student"
                dataKey="student"
                stroke="#ea580c"
                fill="#ea580c"
                fillOpacity={0.5}
              />
              <Radar
                name="Class Avg"
                dataKey="average"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
