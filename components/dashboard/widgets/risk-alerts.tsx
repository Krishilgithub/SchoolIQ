"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const risks = [
  {
    id: 1,
    title: "Low Attendance Warning",
    description: "15 students from Class 10-B have < 75% attendance.",
    severity: "high",
  },
  {
    id: 2,
    title: "Grade Drop detected",
    description: "Science department average fell by 12% this month.",
    severity: "medium",
  },
  {
    id: 3,
    title: "Pending Fee Approvals",
    description: "8 scholarship applications waiting for review.",
    severity: "medium",
  },
];

export function RiskAlerts() {
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Needs Attention</CardTitle>
        </div>
        <CardDescription>Operational risks and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="flex items-start gap-4 rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <div
                className={`mt-1 h-2 w-2 rounded-full ${risk.severity === "high" ? "bg-rose-500" : "bg-amber-500"}`}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{risk.title}</p>
                <p className="text-xs text-muted-foreground">
                  {risk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
