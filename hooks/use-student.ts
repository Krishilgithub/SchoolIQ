"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => api.students.getWebProfile(id),
    enabled: !!id,
  });
}

export function useStudentList() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => api.students.list(),
  });
}
