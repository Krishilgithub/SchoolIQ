"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Annual Sports Day Registration",
    date: "2 hours ago",
    category: "Event",
    important: true,
  },
  {
    id: 2,
    title: "Staff Meeting Rescheduled",
    date: "5 hours ago",
    category: "Admin",
    important: false,
  },
  {
    id: 3,
    title: "Holiday Declaration: rainy day",
    date: "Yesterday",
    category: "General",
    important: true,
  },
  {
    id: 4,
    title: "New ERP Module Training",
    date: "2 days ago",
    category: "Training",
    important: false,
  },
];

export function Announcements() {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Announcements</CardTitle>
        <span className="text-xs text-muted-foreground hover:underline cursor-pointer">
          View All
        </span>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    {item.important && (
                      <Pin className="h-3 w-3 text-orange-500 fill-orange-500 rotate-45" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <span>•</span>
                    <Badge
                      variant="secondary"
                      className="px-1 py-0 text-[10px] font-normal"
                    >
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
