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
    const supabase = createClient();

    let query = supabase
      .from("school_events")
      .select("*")
      .eq("school_id", schoolId)
      .order("start_date", { ascending: true });

    if (startDate) {
      query = query.gte("start_date", startDate.toISOString());
    }

    if (endDate) {
      query = query.lte("start_date", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      throw error;
    }

    return data as SchoolEvent[];
  },

  async createEvent(schoolId: string, eventData: CreateEventData) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("school_events")
      .insert({
        school_id: schoolId,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start_date.toISOString(),
        end_date: eventData.end_date?.toISOString(),
        event_type: eventData.event_type,
        location: eventData.location,
        is_all_day: eventData.is_all_day,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw error;
    }

    return data as SchoolEvent;
  },

  async deleteEvent(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("school_events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
