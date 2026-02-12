"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUpcomingEvents } from "@/lib/services/dashboard";
import type { UpcomingEvent } from "@/lib/types/dashboard";
import { format } from "date-fns";
import { Calendar, GraduationCap, Flag, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpcomingEventsProps {
  schoolId: string;
}

const eventIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  exam: GraduationCap,
  holiday: Star,
  deadline: Flag,
  event: Calendar,
};

const eventColors: Record<string, string> = {
  exam: "bg-purple-100 text-purple-600",
  holiday: "bg-green-100 text-green-600",
  deadline: "bg-amber-100 text-amber-600",
  event: "bg-blue-100 text-blue-600",
};

export function UpcomingEvents({ schoolId }: UpcomingEventsProps) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getUpcomingEvents(schoolId);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [schoolId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Events</CardTitle>
        <Link href="/school-admin/calendar">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming events
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const Icon = eventIcons[event.type];
              const colorClass = eventColors[event.type];

              return (
                <div key={event.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(event.date, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
