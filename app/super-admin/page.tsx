import { superAdminService } from "@/lib/services/super-admin";
import { PageHeader } from "@/components/super-admin/common/page-header";
import { OverviewStats } from "@/components/super-admin/overview/overview-stats";
import { RevenueChart } from "@/components/super-admin/overview/revenue-chart";
import { RecentSignups } from "@/components/super-admin/overview/recent-signups";
import { PlatformHealthWidget } from "@/components/super-admin/overview/platform-health";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const [stats, health, schools] = await Promise.all([
    superAdminService.getExecutiveStats(),
    superAdminService.getPlatformHealth(),
    superAdminService.getRecentSchools(),
  ]);

  return (
    <div className="space-y-8 pt-2 pb-12 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <PageHeader
        title="Executive Overview"
        description="Real-time platform insights, performance metrics, and system control."
      >
        <Button
          asChild
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Link href="/super-admin/schools?action=new">
            <Plus className="mr-2 h-4 w-4" /> Add School
          </Link>
        </Button>
      </PageHeader>

      <OverviewStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <RevenueChart />
        <PlatformHealthWidget data={health} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentSignups schools={schools} />
      </div>
    </div>
  );
}
