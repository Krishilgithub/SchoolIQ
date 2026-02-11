import { OverviewMetrics } from "./_components/overview-metrics";
import { QuickActions } from "./_components/quick-actions";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingEvents } from "./_components/upcoming-events";
import { RefreshButton } from "./_components/refresh-button";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const schoolId = await getCurrentSchoolId();

  if (!schoolId) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your school today.
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Overview Metrics */}
      <section>
        <OverviewMetrics schoolId={schoolId} />
      </section>

      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* Activity and Events Grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RecentActivity schoolId={schoolId} />
        <UpcomingEvents schoolId={schoolId} />
      </section>
    </div>
  );
}
