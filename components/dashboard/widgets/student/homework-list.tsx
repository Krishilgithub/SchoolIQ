"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookCheck, Clock } from "lucide-react";
import { HOMEWORK_LIST } from "@/services/mocks/student-parent-data";

export function HomeworkList() {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookCheck className="h-4 w-4 text-orange-600" />
              Assignments
            </CardTitle>
            <CardDescription>You have 2 items due soon</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            View All
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {HOMEWORK_LIST.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.subject}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${item.status === "pending" ? "text-amber-600" : "text-green-600"}`}
                  >
                    <Clock className="h-3 w-3" />
                    {item.dueDate}
                  </div>
                  {item.status === "pending" && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] h-5 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                    >
                      Pending
                    </Badge>
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
