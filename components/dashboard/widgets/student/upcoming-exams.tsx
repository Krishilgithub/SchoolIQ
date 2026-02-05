"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { UPCOMING_EXAMS } from "@/services/mocks/student-parent-data";

export function UpcomingExams() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-orange-600" />
          Upcoming Exams
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {UPCOMING_EXAMS.map((exam) => (
          <div
            key={exam.id}
            className="flex items-start gap-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-white dark:bg-slate-800 border shadow-sm text-center">
              <span className="text-[10px] font-bold text-orange-600 uppercase leading-none">
                {exam.date.split(" ")[0]}
              </span>
              <span className="text-lg font-bold leading-none">
                {exam.date.split(" ")[1]}
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{exam.subject}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {exam.topics}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
