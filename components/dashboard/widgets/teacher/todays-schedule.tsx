"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MapPin, CheckCircle2, Circle } from "lucide-react";
import { TEACHER_SCHEDULE } from "@/services/mocks/teacher-data";

export function TodaysSchedule() {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Today&apos;s Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-8">
            {TEACHER_SCHEDULE.map((item, index) => (
              <div key={item.id} className="relative pl-6">
                {/* Timeline Dot */}
                <span
                  className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-950 ${
                    item.status === "completed"
                      ? "bg-slate-300 dark:bg-slate-700"
                      : item.status === "current"
                        ? "bg-orange-500"
                        : "bg-slate-200 dark:bg-slate-800 border-2 border-slate-400"
                  }`}
                />

                <div
                  className={`space-y-1 ${item.status === "completed" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-semibold leading-none ${item.status === "current" ? "text-orange-600 dark:text-orange-500" : ""}`}
                    >
                      {item.subject}
                    </h4>
                    <span className="text-xs font-mono text-muted-foreground">
                      {item.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" /> {item.class}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {item.room}
                    </span>
                  </div>

                  {item.status === "current" && (
                    <div className="pt-2">
                      <Badge
                        variant="default"
                        className="bg-orange-600 hover:bg-orange-700 text-[10px] h-5"
                      >
                        Now Active
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
