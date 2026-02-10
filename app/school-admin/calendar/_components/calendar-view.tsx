"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { eventsService, SchoolEvent } from "@/lib/services/events"; // Verify path
import { useCurrentSchool } from "@/hooks/use-current-school"; // Verify path
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Need to check if Badge exists, if not use span
import { Skeleton } from "@/components/ui/skeleton"; // Check if exists
import { CreateEventModal } from "./create-event-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fallback for Badge if it doesn't exist (I'll check later, but safe to assume standard shadcn setup)
// If it fails, I'll fix.

export function CalendarView() {
  const { schoolId } = useCurrentSchool();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["school-events", schoolId, month],
    queryFn: () => {
      if (!schoolId) return [];
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      return eventsService.getEvents(schoolId, start, end);
    },
    enabled: !!schoolId,
  });

  const filteredEvents = events.filter(
    (e) => filterType === "all" || e.event_type === filterType,
  );

  const selectedDateEvents = filteredEvents.filter((event) =>
    date ? isSameDay(new Date(event.start_date), date) : false,
  );

  // Function to determine modifiers for the calendar (e.g., dots for days with events)
  const eventDays = filteredEvents.map((event) => new Date(event.start_date));

  return (
    <div className="grid gap-6 md:grid-cols-[400px_1fr]">
      <Card className="h-fit">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border shadow-sm"
            modifiers={{
              exam: filteredEvents
                .filter((e) => e.event_type === "exam")
                .map((e) => new Date(e.start_date)),
              deadline: filteredEvents
                .filter((e) => e.event_type === "deadline")
                .map((e) => new Date(e.start_date)),
              holiday: filteredEvents
                .filter((e) => e.event_type === "holiday")
                .map((e) => new Date(e.start_date)),
              meeting: filteredEvents
                .filter((e) => e.event_type === "meeting")
                .map((e) => new Date(e.start_date)),
              other: filteredEvents
                .filter(
                  (e) =>
                    !["exam", "deadline", "holiday", "meeting"].includes(
                      e.event_type,
                    ),
                )
                .map((e) => new Date(e.start_date)),
            }}
            modifiersStyles={{
              exam: {
                fontWeight: "bold",
                textDecoration:
                  "underline decoration-red-500 decoration-2 underline-offset-4",
              },
              deadline: {
                fontWeight: "bold",
                textDecoration:
                  "underline decoration-orange-500 decoration-2 underline-offset-4",
              },
              holiday: {
                fontWeight: "bold",
                textDecoration:
                  "underline decoration-green-500 decoration-2 underline-offset-4",
              },
              meeting: {
                fontWeight: "bold",
                textDecoration:
                  "underline decoration-blue-500 decoration-2 underline-offset-4",
              },
              other: {
                fontWeight: "bold",
                textDecoration:
                  "underline decoration-gray-500 decoration-2 underline-offset-4",
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="holiday">Holidays</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col space-y-2 rounded-lg border p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{event.title}</span>
                    <Badge variant={getBadgeVariant(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.start_date), "h:mm a")}
                      {event.end_date &&
                        ` - ${format(new Date(event.end_date), "h:mm a")}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center space-y-2 text-center text-muted-foreground">
                <CalendarIcon className="h-10 w-10 opacity-50" />
                <p>No events scheduled for this day.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <CreateEventModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultDate={date}
      />
    </div>
  );
}

function getBadgeVariant(
  type: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "exam":
    case "deadline":
      return "destructive";
    case "holiday":
      return "secondary";
    case "meeting":
      return "outline";
    default:
      return "default";
  }
}
