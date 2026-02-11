import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];
type RoomInsert = Database['public']['Tables']['rooms']['Insert'];
type RoomUpdate = Database['public']['Tables']['rooms']['Update'];

/**
 * Room Service
 * Manages school rooms/venues for timetable scheduling
 */
export class RoomService {
  /**
   * Get all rooms for a school
   */
  static async getRooms(schoolId: string, includeUnavailable = false): Promise<Room[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('school_id', schoolId);

    if (!includeUnavailable) {
      query = query.eq('is_available', true);
    }

    const { data, error } = await query.order('building').order('room_number');

    if (error) throw error;
    return data;
  }

  /**
   * Get room by ID
   */
  static async getRoomById(id: string): Promise<Room | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create room
   */
  static async createRoom(room: RoomInsert): Promise<Room> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update room
   */
  static async updateRoom(id: string, updates: RoomUpdate): Promise<Room> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete room
   */
  static async deleteRoom(id: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Mark room as unavailable
   */
  static async markUnavailable(id: string): Promise<Room> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .update({ is_available: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get rooms by type
   */
  static async getRoomsByType(schoolId: string, roomType: string): Promise<Room[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('school_id', schoolId)
      .eq('room_type', roomType)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  /**
   * Get rooms by building
   */
  static async getRoomsByBuilding(schoolId: string, building: string): Promise<Room[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('school_id', schoolId)
      .eq('building', building)
      .eq('is_available', true)
      .order('room_number');

    if (error) throw error;
    return data;
  }

  /**
   * Check room availability for a period
   */
  static async checkAvailability(
    roomId: string, 
    dayOfWeek: number, 
    periodId: string, 
    timetableId: string
  ): Promise<boolean> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('id')
      .eq('room_id', roomId)
      .eq('day_of_week', dayOfWeek)
      .eq('period_id', periodId)
      .eq('timetable_id', timetableId)
      .limit(1);

    if (error) throw error;
    return data.length === 0;
  }

  /**
   * Get room utilization stats
   */
  static async getRoomUtilization(schoolId: string, timetableId: string) {
    const supabase = await createClient();
    
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('school_id', schoolId)
      .eq('is_available', true);

    if (!rooms) return [];

    const utilizationData = await Promise.all(
      rooms.map(async (room) => {
        const { count, error } = await supabase
          .from('timetable_entries')
          .select('id', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('timetable_id', timetableId);

        if (error) return { room: room.name, usage_count: 0, utilization_percentage: 0 };

        // Assuming 5 days * number of periods per day = max slots
        const totalSlots = 35; // Can be calculated dynamically
        const utilizationPercentage = ((count || 0) / totalSlots) * 100;

        return {
          room: room.name,
          usage_count: count || 0,
          utilization_percentage: Math.round(utilizationPercentage)
        };
      })
    );

    return utilizationData.sort((a, b) => b.utilization_percentage - a.utilization_percentage);
  }

  /**
   * Bulk create rooms
   */
  static async bulkCreateRooms(rooms: RoomInsert[]): Promise<Room[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .insert(rooms)
      .select();

    if (error) throw error;
    return data;
  }
}
