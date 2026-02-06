"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AnalyticsService } from "@/services/analytics/mock-service";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PerformanceHeatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-heatmap"],
    queryFn: AnalyticsService.getSubjectHeatmap,
  });

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;
  if (!data) return null;

  // Pivot data for grid
  const subjects = Array.from(new Set(data.map((d) => d.subject)));
  const classes = Array.from(new Set(data.map((d) => d.classId))).sort();

  const getColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-400";
    if (score >= 70) return "bg-yellow-400";
    if (score >= 60) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>Academic Performance Heatmap</CardTitle>
        <CardDescription>Average scores by Class & Subject</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th className="p-2"></th>
                {subjects.map((s) => (
                  <th key={s} className="p-2 font-medium text-muted-foreground">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((classId) => (
                <tr key={classId} className="border-b border-border/50">
                  <td className="p-2 font-medium">{classId}</td>
                  {subjects.map((subject) => {
                    const cell = data.find(
                      (d) => d.classId === classId && d.subject === subject,
                    );
                    return (
                      <td key={subject} className="p-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`h-10 w-full rounded-md flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity hover:opacity-80 ${getColor(
                                  cell?.avgScore || 0,
                                )}`}
                              >
                                {cell?.avgScore}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">
                                {classId} - {subject}
                              </p>
                              <p>Avg: {cell?.avgScore}</p>
                              <p>Attendance: {cell?.attendance}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
