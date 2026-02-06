"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertTriangle, ArrowRight } from "lucide-react";
import { AnalyticsService } from "@/services/analytics/mock-service";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RiskTable() {
  const { data: students, isLoading } = useQuery({
    queryKey: ["risk-students"],
    queryFn: AnalyticsService.getRiskAnalysis,
  });

  if (isLoading) return <Skeleton className="h-[500px] w-full" />;

  return (
    <div className="rounded-md border bg-white dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Risk Factors</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students?.map((student) => (
            <TableRow key={student.studentId}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{student.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ID: {student.studentId}
                  </span>
                </div>
              </TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      student.riskLevel === "high"
                        ? "text-red-600"
                        : student.riskLevel === "medium"
                          ? "text-orange-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {student.riskScore}
                  </span>
                  {student.riskLevel === "high" && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {student.factors.map((factor, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[10px] bg-slate-50"
                    >
                      {factor}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    student.trend === "worsening" ? "destructive" : "secondary"
                  }
                >
                  {student.trend}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-orange-600">
                      Create Intervention
                    </DropdownMenuItem>
                    <DropdownMenuItem>Contact Parents</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
