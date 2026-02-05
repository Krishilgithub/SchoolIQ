"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { RECENT_GRADES } from "@/services/mocks/student-parent-data";

export function RecentGrades() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-orange-600" />
          Recent Grades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {RECENT_GRADES.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-2 ring-offset-2 ${
                    item.grade.startsWith("A")
                      ? "bg-green-100 text-green-700 ring-green-100"
                      : item.grade.startsWith("B")
                        ? "bg-blue-100 text-blue-700 ring-blue-100"
                        : "bg-slate-100 text-slate-700 ring-slate-100"
                  }`}
                >
                  {item.grade}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.subject}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
