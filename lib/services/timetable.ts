import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Timetable = Database['public']['Tables']['timetables']['Row'];
type TimetableInsert = Database['public']['Tables']['timetables']['Insert'];
type TimetableUpdate = Database['public']['Tables']['timetables']['Update'];
type TimetableEntry = Database['public']['Tables']['timetable_entries']['Row'];
type TimetableEntryInsert = Database['public']['Tables']['timetable_entries']['Insert'];
type Period = Database['public']['Tables']['periods']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];
type Substitution = Database['public']['Tables']['substitutions']['Row'];
type TimetableConflict = Database['public']['Tables']['timetable_conflicts']['Row'];

export interface TimetableWithEntries extends Timetable {
  entries?: TimetableEntry[];
  conflicts?: TimetableConflict[];
}

export interface ConflictDetectionResult {
  conflict_type: string;
  description: string;
  affected_entries: string[];
}

/**
 * Timetable Service
 * Handles all operations related to school timetables including:
 * - CRUD operations for timetables
 * - Conflict detection
 * - Version management
 * - Publishing workflow
 */
export class TimetableService {
  /**
   * Get all timetables for a school
   */
  static async getTimetables(schoolId: string): Promise<Timetable[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get current active timetable
   */
  static async getCurrentTimetable(schoolId: string): Promise<TimetableWithEntries | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetables')
      .select(`
        *,
        entries:timetable_entries(
          *,
          period:periods(*),
          room:rooms(*),
          class:classes(*),
          section:sections(*),
          subject:subjects(*),
          teacher:profiles(*)
        )
      `)
      .eq('school_id', schoolId)
      .eq('is_current', true)
      .eq('status', 'published')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get timetable by ID with all relations
   */
  static async getTimetableById(id: string): Promise<TimetableWithEntries | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetables')
      .select(`
        *,
        entries:timetable_entries(
          *,
          period:periods(*),
          room:rooms(*),
          class:classes(*),
          section:sections(*),
          subject:subjects(*),
          teacher:profiles(*)
        ),
        conflicts:timetable_conflicts(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create new timetable
   */
  static async createTimetable(timetable: TimetableInsert): Promise<Timetable> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetables')
      .insert(timetable)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update timetable (only allowed if status is 'draft')
   */
  static async updateTimetable(id: string, updates: TimetableUpdate): Promise<Timetable> {
    const supabase = await createClient();
    
    // Check current status
    const { data: current } = await supabase
      .from('timetables')
      .select('status')
      .eq('id', id)
      .single();

    if (current?.status === 'published') {
      throw new Error('Cannot edit published timetable. Create a new version instead.');
    }

    const { data, error } = await supabase
      .from('timetables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete timetable (only drafts)
   */
  static async deleteTimetable(id: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('timetables')
      .delete()
      .eq('id', id)
      .eq('status', 'draft');

    if (error) throw error;
  }

  /**
   * Add entry to timetable
   */
  static async addEntry(entry: TimetableEntryInsert): Promise<TimetableEntry> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetable_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update timetable entry
   */
  static async updateEntry(entryId: string, updates: Partial<TimetableEntryInsert>): Promise<TimetableEntry> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetable_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete timetable entry
   */
  static async deleteEntry(entryId: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('timetable_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  }

  /**
   * Detect conflicts in timetable using database function
   */
  static async detectConflicts(timetableId: string): Promise<ConflictDetectionResult[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .rpc('detect_timetable_conflicts', { p_timetable_id: timetableId });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all conflicts for a timetable
   */
  static async getConflicts(timetableId: string): Promise<TimetableConflict[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetable_conflicts')
      .select('*')
      .eq('timetable_id', timetableId)
      .eq('resolution_status', 'unresolved')
      .order('severity', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Publish timetable (creates version snapshot)
   */
  static async publishTimetable(timetableId: string, publishedBy: string): Promise<Timetable> {
    const supabase = await createClient();

    // First detect conflicts
    const conflicts = await this.detectConflicts(timetableId);
    
    if (conflicts.length > 0) {
      throw new Error(`Cannot publish timetable with ${conflicts.length} conflicts`);
    }

    // Update timetable status (trigger will create version)
    const { data, error } = await supabase
      .from('timetables')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: publishedBy,
        is_current: true
      })
      .eq('id', timetableId)
      .select()
      .single();

    if (error) throw error;

    // Deactivate other current timetables
    await supabase
      .from('timetables')
      .update({ is_current: false })
      .eq('school_id', data.school_id)
      .neq('id', timetableId);

    return data;
  }

  /**
   * Archive timetable
   */
  static async archiveTimetable(timetableId: string): Promise<Timetable> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('timetables')
      .update({ status: 'archived', is_current: false })
      .eq('id', timetableId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get teacher's schedule
   */
  static async getTeacherSchedule(teacherId: string, timetableId?: string) {
    const supabase = await createClient();
    
    let query = supabase
      .from('timetable_entries')
      .select(`
        *,
        period:periods(*),
        room:rooms(*),
        class:classes(*),
        section:sections(*),
        subject:subjects(*),
        timetable:timetables(*)
      `)
      .eq('teacher_id', teacherId);

    if (timetableId) {
      query = query.eq('timetable_id', timetableId);
    } else {
      // Get current timetable entries
      query = query.in('timetable_id', 
        supabase.from('timetables').select('id').eq('is_current', true)
      );
    }

    const { data, error } = await query.order('day_of_week').order('period_id');

    if (error) throw error;
    return data;
  }

  /**
   * Get class/section schedule
   */
  static async getClassSchedule(classId: string, sectionId?: string, timetableId?: string) {
    const supabase = await createClient();
    
    let query = supabase
      .from('timetable_entries')
      .select(`
        *,
        period:periods(*),
        room:rooms(*),
        subject:subjects(*),
        teacher:profiles(*),
        timetable:timetables(*)
      `)
      .eq('class_id', classId);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    if (timetableId) {
      query = query.eq('timetable_id', timetableId);
    } else {
      query = query.in('timetable_id', 
        supabase.from('timetables').select('id').eq('is_current', true)
      );
    }

    const { data, error } = await query.order('day_of_week').order('period_id');

    if (error) throw error;
    return data;
  }
}
