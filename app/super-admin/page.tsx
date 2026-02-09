import { superAdminService } from "@/lib/services/super-admin";
import { MetricCard } from "@/components/admin/dashboard/metric-card";
import { PlatformHealthWidget } from "@/components/admin/dashboard/platform-health";
import { RevenueChartWidget } from "@/components/admin/dashboard/revenue-chart";
import { ActiveSchoolsWidget } from "@/components/admin/dashboard/active-schools";
import { RecentActivityWidget } from "@/components/admin/dashboard/recent-activity";
import { Building2, Users, DollarSign, Activity, Ticket } from "lucide-react";

export default async function SuperAdminDashboard() {
  // Parallel data fetching
  const [stats, health, schools, tickets] = await Promise.all([
    superAdminService.getExecutiveStats(),
    superAdminService.getPlatformHealth(),
    superAdminService.getRecentSchools(),
    superAdminService.getRecentTickets(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Executive Overview
          </h2>
          <p className="text-muted-foreground">
            Real-time platform insights and control.
          </p>
        </div>
      </div>

      {/* Row 1: Executive Stats (Bento Top) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Active Schools"
          value={stats[0].value}
          change={stats[0].change}
          trend={stats[0].trend}
          icon={<Building2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Students"
          value={stats[1].value}
          change={stats[1].change}
          trend={stats[1].trend}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Monthly Revenue"
          value={stats[2].value}
          change={stats[2].change}
          trend={stats[2].trend}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg Uptime"
          value={stats[3].value}
          change={stats[3].change}
          trend={stats[3].trend}
          icon={<Activity className="h-4 w-4" />}
          className="bg-gradient-to-br from-card to-emerald-500/10 border-emerald-500/20"
        />
        <MetricCard
          label="Open Tickets"
          value={stats[4].value}
          change={stats[4].change}
          trend={stats[4].trend}
          icon={<Ticket className="h-4 w-4" />}
        />
      </div>

      {/* Row 2: Charts & Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChartWidget />
        <PlatformHealthWidget data={health} />
      </div>

      {/* Row 3: Tables & Lists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <ActiveSchoolsWidget schools={schools} />
        <RecentActivityWidget tickets={tickets} />
      </div>
    </div>
  );
}
