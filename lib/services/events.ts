import { createClient } from "@/lib/supabase/client";

export type EventType =
  | "holiday"
  | "event"
  | "deadline"
  | "meeting"
  | "exam"
  | "other";

export interface SchoolEvent {
  id: string;
  school_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  event_type: EventType;
  location: string | null;
  is_all_day: boolean;
  created_by: string | null;
  created_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  event_type: EventType;
  location?: string;
  is_all_day?: boolean;
}

export const eventsService = {
  async getEvents(schoolId: string, startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append("start_date", startDate.toISOString());
    }
    
    if (endDate) {
      params.append("end_date", endDate.toISOString());
    }

    const url = `/api/school-admin/events${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      console.error("Error fetching events:", error);
      throw new Error(error.error || "Failed to fetch events");
    }

    return response.json() as Promise<SchoolEvent[]>;
  },

  async createEvent(schoolId: string, eventData: CreateEventData) {
    const response = await fetch("/api/school-admin/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start_date.toISOString(),
        end_date: eventData.end_date?.toISOString(),
        event_type: eventData.event_type,
        location: eventData.location,
        is_all_day: eventData.is_all_day ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error creating event:", error);
      throw new Error(error.error || "Failed to create event");
    }

    return response.json() as Promise<SchoolEvent>;
  },

  async deleteEvent(id: string) {
    const response = await fetch(`/api/school-admin/events/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error deleting event:", error);
      throw new Error(error.error || "Failed to delete event");
    }

    return response.json();
  },
};
