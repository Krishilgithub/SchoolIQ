"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Term 1 Academic Summary",
      desc: "Comprehensive grade analysi across all classes.",
      date: "Dec 2023",
    },
    {
      title: "Attendance & Truancy Report",
      desc: "Detailed breakdown of absences and late arrivals.",
      date: "Nov 2023",
    },
    {
      title: "Intervention Efficacy",
      desc: "Success rate of active support plans.",
      date: "Oct 2023",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports Center</h2>
          <p className="text-muted-foreground">
            Generated insights and exportable data.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                <FileText className="h-4 w-4 inline mr-2 text-muted-foreground" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mt-2 text-xs">
                {report.desc}
              </CardDescription>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Generated: {report.date}
                </span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
