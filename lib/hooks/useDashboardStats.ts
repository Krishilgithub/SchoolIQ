import useSWR from "swr";
import { getDashboardStats } from "@/lib/services/dashboard";
import type { DashboardStats } from "@/lib/types/dashboard";

/**
 * Custom hook for fetching and caching dashboard statistics
 * Auto-refreshes every 30 seconds
 */
export function useDashboardStats(schoolId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    schoolId ? ["dashboard-stats", schoolId] : null,
    () => getDashboardStats(schoolId!),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
