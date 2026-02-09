import { superAdminService } from "@/lib/services/super-admin";
import { Building2, Users, CreditCard } from "lucide-react";
import { DashboardHeader } from "@/components/super-admin/dashboard/header";
import { StatsRow } from "@/components/super-admin/dashboard/stats-row";
import { AuditWidget } from "@/components/super-admin/dashboard/audit-widget";
import { HealthWidget } from "@/components/super-admin/dashboard/health-widget";
import { StorageChart } from "@/components/super-admin/dashboard/storage-chart";
import { RecentSchools } from "@/components/super-admin/dashboard/recent-schools";

export default async function SuperAdminDashboard() {
  // Parallel data fetching for performance
  const [stats, systemHealth, recentAudit, recentSchools] = await Promise.all([
    superAdminService.getExecutiveStats(),
    superAdminService.getPlatformHealth(), // Was getSystemHealth, updated to match service
    superAdminService.getRecentAuditLogs(), // Get audit logs for the audit widget
    superAdminService.getRecentSchools(),
  ]);

  // Transform data for UI components
  // Stats are already in the format needed by StatsRow (StatMetric[])
  // We just need to ensure the icons and colors match what we want.
  // The service returns: Label, Value, Change, Trend, History.
  // The UI expects: label, value, icon, trend, trendUp, color.

  // Let's map them.
  const kpiStats = [
    {
      ...stats.find((s) => s.label === "Active Schools")!,
      value: String(
        stats.find((s) => s.label === "Active Schools")?.value || "0",
      ),
      icon: Building2,
      trendUp: stats.find((s) => s.label === "Active Schools")?.trend === "up",
      color: "violet" as const,
      trend: `${stats.find((s) => s.label === "Active Schools")?.change}%`,
    },
    {
      ...stats.find((s) => s.label === "Total Users")!,
      value: String(stats.find((s) => s.label === "Total Users")?.value || "0"),
      icon: Users,
      trendUp: stats.find((s) => s.label === "Total Users")?.trend === "up",
      color: "pink" as const,
      trend: `${stats.find((s) => s.label === "Total Users")?.change}%`,
    },
    {
      ...stats.find((s) => s.label === "Monthly Revenue")!,
      value: String(
        stats.find((s) => s.label === "Monthly Revenue")?.value || "$0",
      ),
      icon: CreditCard,
      trendUp: stats.find((s) => s.label === "Monthly Revenue")?.trend === "up",
      color: "orange" as const,
      trend: `${stats.find((s) => s.label === "Monthly Revenue")?.change}%`,
    },
  ];

  return (
    <div className="pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader />

      <StatsRow stats={kpiStats} />

      {/* Middle Section: Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Recent Activity / Audit Logs */}
        <div className="lg:col-span-4 h-[400px]">
          <AuditWidget logs={recentAudit} />
        </div>

        {/* System Health */}
        <div className="lg:col-span-4 h-[400px]">
          <HealthWidget health={systemHealth} />
        </div>

        {/* Storage Chart */}
        <div className="lg:col-span-4 h-[400px]">
          <StorageChart usage={systemHealth.storageUsage || 0} total={1000} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[400px]">
          <RecentSchools schools={recentSchools.slice(0, 5)} />
        </div>

        {/* Revenue/Promo Widget - Placeholder for now, or reuse HealthWidget style */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-orange-600 p-6 shadow-md text-white flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4 backdrop-blur-sm">
              NEW FEATURE
            </span>
            <h3 className="text-2xl font-bold font-heading mb-2">
              API Integration Available
            </h3>
            <p className="text-white/80 text-sm">
              Connect SchoolIQ with your favorite LMS tools using our new REST
              API.
            </p>
          </div>

          <button className="bg-white text-primary font-bold py-3 px-6 rounded-xl hover:bg-white/90 transition-colors w-full sm:w-auto shadow-lg">
            Explore Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
