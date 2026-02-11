import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Period = Database['public']['Tables']['periods']['Row'];
type PeriodInsert = Database['public']['Tables']['periods']['Insert'];
type PeriodUpdate = Database['public']['Tables']['periods']['Update'];

/**
 * Period Service
 * Manages school periods (time slots) for timetables
 */
export class PeriodService {
  /**
   * Get all periods for a school
   */
  static async getPeriods(schoolId: string): Promise<Period[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('period_number');

    if (error) throw error;
    return data;
  }

  /**
   * Get period by ID
   */
  static async getPeriodById(id: string): Promise<Period | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create period
   */
  static async createPeriod(period: PeriodInsert): Promise<Period> {
    const supabase = await createClient();
    
    // Calculate duration if not provided
    if (!period.duration_minutes && period.start_time && period.end_time) {
      const start = new Date(`1970-01-01T${period.start_time}`);
      const end = new Date(`1970-01-01T${period.end_time}`);
      period.duration_minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    }

    const { data, error } = await supabase
      .from('periods')
      .insert(period)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update period
   */
  static async updatePeriod(id: string, updates: PeriodUpdate): Promise<Period> {
    const supabase = await createClient();
    
    // Recalculate duration if times are updated
    if (updates.start_time || updates.end_time) {
      const current = await this.getPeriodById(id);
      if (current) {
        const startTime = updates.start_time || current.start_time;
        const endTime = updates.end_time || current.end_time;
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        updates.duration_minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
      }
    }

    const { data, error } = await supabase
      .from('periods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete period
   */
  static async deletePeriod(id: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('periods')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Deactivate period (soft delete - preserves historical data)
   */
  static async deactivatePeriod(id: string): Promise<Period> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('periods')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Bulk create periods (e.g., for school setup)
   */
  static async bulkCreatePeriods(periods: PeriodInsert[]): Promise<Period[]> {
    const supabase = await createClient();

    // Calculate durations
    const periodsWithDuration = periods.map(p => {
      if (!p.duration_minutes && p.start_time && p.end_time) {
        const start = new Date(`1970-01-01T${p.start_time}`);
        const end = new Date(`1970-01-01T${p.end_time}`);
        return {
          ...p,
          duration_minutes: Math.floor((end.getTime() - start.getTime()) / 60000)
        };
      }
      return p;
    });
    
    const { data, error } = await supabase
      .from('periods')
      .insert(periodsWithDuration)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Get period schedule (all periods with times for a day)
   */
  static async getDaySchedule(schoolId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('start_time');

    if (error) throw error;

    // Group breaks and teaching periods
    const schedule = {
      teaching_periods: data?.filter(p => !p.is_break) || [],
      breaks: data?.filter(p => p.is_break) || [],
      total_duration_minutes: data?.reduce((sum, p) => sum + (p.duration_minutes || 0), 0) || 0
    };

    return schedule;
  }
}
