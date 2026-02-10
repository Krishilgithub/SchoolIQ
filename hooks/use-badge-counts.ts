"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ClassService } from "@/lib/services/class";
import { SubjectService } from "@/lib/services/subject";

/**
 * Hook to fetch badge counts for sidebar navigation
 */
export function useBadgeCounts() {
  const { schoolId } = useAuth();
  const [counts, setCounts] = useState({
    exams: 0,
    assignments: 0,
    attendance: "!" as string | number,
    pendingApprovals: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      // For now, we'll just set some placeholder values
      // In future, we'll fetch actual counts from the backend

      // Example: Get total number of classes for academic year
      const currentYear = `${new Date().getFullYear()}-${
        new Date().getFullYear() + 1
      }`;
      const classesResult = await ClassService.getClasses(schoolId, {
        academicYear: currentYear,
      });

      // Example: Get total subjects
      const subjectsResult = await SubjectService.getSubjects(schoolId);

      setCounts({
        exams: 0, // TODO: Fetch from exams service
        assignments: 0, // TODO: Fetch from assignments service
        attendance: "!", // Indicator for attention needed
        pendingApprovals: 0, // TODO: Fetch from approvals service
        unreadMessages: 0, // TODO: Fetch from messages service
      });
    } catch (error) {
      console.error("Error loading badge counts:", error);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadCounts();

    // Refresh counts every 5 minutes
    const interval = setInterval(loadCounts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadCounts]);

  const refreshCounts = () => {
    loadCounts();
  };

  return {
    counts,
    loading,
    refreshCounts,
  };
}
