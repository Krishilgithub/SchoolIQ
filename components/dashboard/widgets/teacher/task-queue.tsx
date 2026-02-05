"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, AlertCircle } from "lucide-react";
import { TEACHER_TASKS } from "@/services/mocks/teacher-data";

export function TaskQueue() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-orange-600" />
          Task Queue
        </CardTitle>
        <CardDescription>3 High Priority items</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {TEACHER_TASKS.map((task) => (
          <div
            key={task.id}
            className="flex items-start space-x-4 rounded-lg border p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <div
              className={`mt-0.5 rounded-full p-1 ${task.priority === "high" ? "bg-red-100 text-red-600 dark:bg-red-900/20" : "bg-slate-100 text-slate-600"}`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.deadline}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <span className="sr-only">Complete</span>
              <div className="h-4 w-4 rounded-full border border-slate-300 hover:bg-orange-100 hover:border-orange-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" className="w-full text-xs h-8">
          View All Tasks
        </Button>
      </CardContent>
    </Card>
  );
}
