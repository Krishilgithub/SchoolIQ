import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { DatabaseService } from "@/services/database";

// Client-side hook
export function useStudents(schoolId: string) {
  const supabase = createClient();
  const dbService = new DatabaseService(supabase);

  return useQuery({
    queryKey: ["students", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      return await dbService.getStudentsBySchool(schoolId);
    },
    enabled: !!schoolId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useStudent(studentId: string) {
  const supabase = createClient();
  const dbService = new DatabaseService(supabase);

  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      return await dbService.getStudentById(studentId);
    },
    enabled: !!studentId,
  });
}
