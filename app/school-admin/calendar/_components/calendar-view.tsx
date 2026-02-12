"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService, SchoolEvent } from "@/lib/services/events";
import { useCurrentSchool } from "@/hooks/use-current-school";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  BookOpen,
  Users,
  Bell,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateEventModal } from "./create-event-modal";
import { EditEventModal } from "./edit-event-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const { schoolId } = useCurrentSchool();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["school-events", schoolId, currentMonth],
    queryFn: () => {
      if (!schoolId) return [];
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      return eventsService.getEvents(schoolId, start, end);
    },
    enabled: !!schoolId,
  });

  const filteredEvents = events.filter(
    (e) => filterType === "all" || e.event_type === filterType,
  );

  const selectedDateEvents = filteredEvents.filter((event) =>
    isSameDay(new Date(event.start_date), selectedDate),
  );

  // Get calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) =>
      isSameDay(new Date(event.start_date), day),
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-500";
      case "deadline":
        return "bg-orange-500";
      case "holiday":
        return "bg-green-500";
      case "meeting":
        return "bg-blue-500";
      default:
        return "bg-purple-500";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "exam":
        return <BookOpen className="h-3.5 w-3.5" />;
      case "meeting":
        return <Users className="h-3.5 w-3.5" />;
      case "holiday":
        return <CalendarIcon className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventsService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["school-events"] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="exam">Exams</SelectItem>
              <SelectItem value="deadline">Deadlines</SelectItem>
              <SelectItem value="holiday">Holidays</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {[
          { type: "exam", label: "Exams", color: "bg-red-500" },
          { type: "deadline", label: "Deadlines", color: "bg-orange-500" },
          { type: "holiday", label: "Holidays", color: "bg-green-500" },
          { type: "meeting", label: "Meetings", color: "bg-blue-500" },
          { type: "other", label: "Other", color: "bg-purple-500" },
        ].map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full", item.color)} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative min-h-24 rounded-lg border-2 p-2 text-left transition-all hover:border-primary/50 hover:shadow-md",
                      isSelected && "border-primary bg-primary/5 shadow-md",
                      !isSelected && "border-transparent bg-muted/30",
                      !isCurrentMonth && "opacity-40",
                      isTodayDate &&
                        !isSelected &&
                        "border-primary/30 bg-primary/10",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isTodayDate &&
                            "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded text-white truncate",
                            getEventTypeColor(event.event_type),
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1.5">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events Sidebar */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedDateEvents.length === 0
                ? "No events"
                : `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? "s" : ""}`}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : selectedDateEvents.length > 0 ? (
                <div className="divide-y">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-1 rounded-lg p-2 text-white",
                            getEventTypeColor(event.event_type),
                          )}
                        >
                          {getEventTypeIcon(event.event_type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold leading-tight">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getBadgeVariant(event.event_type)}
                                className="capitalize shrink-0"
                              >
                                {event.event_type}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setEditingEvent(event)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {event.is_all_day
                                  ? "All day"
                                  : `${format(new Date(event.start_date), "h:mm a")}${
                                      event.end_date
                                        ? ` - ${format(new Date(event.end_date), "h:mm a")}`
                                        : ""
                                    }`}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-96 flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    No events scheduled
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    There are no events scheduled for this day.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <CreateEventModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultDate={selectedDate}
      />

      {editingEvent && (
        <EditEventModal
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
        />
      )}
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
