import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Substitution = Database['public']['Tables']['substitutions']['Row'];
type SubstitutionInsert = Database['public']['Tables']['substitutions']['Insert'];
type SubstitutionUpdate = Database['public']['Tables']['substitutions']['Update'];

export interface SubstitutionWithDetails extends Substitution {
  timetable_entry?: any;
  original_teacher?: any;
  substitute_teacher?: any;
}

/**
 * Substitution Service
 * Manages teacher substitutions/replacements in timetables
 */
export class SubstitutionService {
  /**
   * Get all substitutions for a school (filtered by date range)
   */
  static async getSubstitutions(
    schoolId: string, 
    startDate?: string, 
    endDate?: string,
    status?: string
  ): Promise<SubstitutionWithDetails[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('substitutions')
      .select(`
        *,
        timetable_entry:timetable_entries(
          *,
          period:periods(*),
          class:classes(*),
          section:sections(*),
          subject:subjects(*)
        ),
        original_teacher:profiles!substitutions_original_teacher_id_fkey(*),
        substitute_teacher:profiles!substitutions_substitute_teacher_id_fkey(*),
        assigned_by_user:profiles!substitutions_assigned_by_fkey(*)
      `)
      .in('timetable_entry.timetable.school_id', [schoolId]);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get substitution by ID
   */
  static async getSubstitutionById(id: string): Promise<SubstitutionWithDetails | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('substitutions')
      .select(`
        *,
        timetable_entry:timetable_entries(
          *,
          period:periods(*),
          class:classes(*),
          section:sections(*),
          subject:subjects(*)
        ),
        original_teacher:profiles!substitutions_original_teacher_id_fkey(*),
        substitute_teacher:profiles!substitutions_substitute_teacher_id_fkey(*),
        assigned_by_user:profiles!substitutions_assigned_by_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create substitution request
   */
  static async createSubstitution(substitution: SubstitutionInsert): Promise<Substitution> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('substitutions')
      .insert(substitution)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Assign substitute teacher
   */
  static async assignSubstitute(
    substitutionId: string, 
    substituteTeacherId: string,
    assignedBy: string
  ): Promise<Substitution> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('substitutions')
      .update({
        substitute_teacher_id: substituteTeacherId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        assigned_by: assignedBy
      })
      .eq('id', substitutionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark substitution as completed
   */
  static async completeSubstitution(substitutionId: string): Promise<Substitution> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('substitutions')
      .update({ status: 'completed' })
      .eq('id', substitutionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cancel substitution
   */
  static async cancelSubstitution(substitutionId: string): Promise<Substitution> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('substitutions')
      .update({ status: 'cancelled' })
      .eq('id', substitutionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pending substitutions (awaiting assignment)
   */
  static async getPendingSubstitutions(schoolId: string): Promise<SubstitutionWithDetails[]> {
    return this.getSubstitutions(schoolId, undefined, undefined, 'pending');
  }

  /**
   * Get teacher's substitutions (as original or substitute)
   */
  static async getTeacherSubstitutions(
    teacherId: string,
    asOriginal: boolean = true,
    startDate?: string
  ): Promise<SubstitutionWithDetails[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('substitutions')
      .select(`
        *,
        timetable_entry:timetable_entries(
          *,
          period:periods(*),
          class:classes(*),
          section:sections(*),
          subject:subjects(*)
        ),
        original_teacher:profiles!substitutions_original_teacher_id_fkey(*),
        substitute_teacher:profiles!substitutions_substitute_teacher_id_fkey(*)
      `);

    if (asOriginal) {
      query = query.eq('original_teacher_id', teacherId);
    } else {
      query = query.eq('substitute_teacher_id', teacherId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    const { data, error } = await query
      .order('date', { ascending: false })
      .order('timetable_entry.period.start_time');

    if (error) throw error;
    return data || [];
  }

  /**
   * Find available substitute teachers
   */
  static async findAvailableTeachers(
    schoolId: string,
    date: string,
    periodId: string,
    subjectId?: string
  ) {
    const supabase = await createClient();

    // Get all teachers in the school
    let teacherQuery = supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('school_id', schoolId)
      .eq('role', 'teacher')
      .eq('is_suspended', false);

    const { data: allTeachers } = await teacherQuery;
    
    if (!allTeachers) return [];

    // Get current timetable
    const { data: currentTimetable } = await supabase
      .from('timetables')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_current', true)
      .single();

    if (!currentTimetable) return allTeachers;

    // Check which teachers are already assigned during this period
    const dayOfWeek = new Date(date).getDay();
    
    const { data: busyTeachers } = await supabase
      .from('timetable_entries')
      .select('teacher_id')
      .eq('timetable_id', currentTimetable.id)
      .eq('day_of_week', dayOfWeek)
      .eq('period_id', periodId);

    const busyTeacherIds = new Set(busyTeachers?.map(t => t.teacher_id));

    // Filter out busy teachers
    let availableTeachers = allTeachers.filter(t => !busyTeacherIds.has(t.id));

    // If subject is specified, prioritize teachers who teach that subject
    if (subjectId) {
      const { data: subjectTeachers } = await supabase
        .from('teacher_assignments')
        .select('teacher_id')
        .eq('subject_id', subjectId)
        .eq('school_id', schoolId);

      const subjectTeacherIds = new Set(subjectTeachers?.map(t => t.teacher_id));
      
      // Sort: subject teachers first
      availableTeachers.sort((a, b) => {
        const aTeachesSubject = subjectTeacherIds.has(a.id);
        const bTeachesSubject = subjectTeacherIds.has(b.id);
        if (aTeachesSubject && !bTeachesSubject) return -1;
        if (!aTeachesSubject && bTeachesSubject) return 1;
        return 0;
      });
    }

    return availableTeachers;
  }

  /**
   * Get substitution statistics for reporting
   */
  static async getSubstitutionStats(schoolId: string, startDate: string, endDate: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('substitutions')
      .select('status, original_teacher_id, substitute_teacher_id')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(s => s.status === 'pending').length || 0,
      assigned: data?.filter(s => s.status === 'assigned').length || 0,
      completed: data?.filter(s => s.status === 'completed').length || 0,
      cancelled: data?.filter(s => s.status === 'cancelled').length || 0,
      most_substituted_teachers: this.getMostSubstitutedTeachers(data || []),
      most_substitute_teachers: this.getMostSubstituteTeachers(data || [])
    };

    return stats;
  }

  private static getMostSubstitutedTeachers(substitutions: Substitution[]) {
    const counts: Record<string, number> = {};
    substitutions.forEach(s => {
      counts[s.original_teacher_id] = (counts[s.original_teacher_id] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([teacherId, count]) => ({ teacher_id: teacherId, count }));
  }

  private static getMostSubstituteTeachers(substitutions: Substitution[]) {
    const counts: Record<string, number> = {};
    substitutions.forEach(s => {
      if (s.substitute_teacher_id) {
        counts[s.substitute_teacher_id] = (counts[s.substitute_teacher_id] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([teacherId, count]) => ({ teacher_id: teacherId, count }));
  }
}
