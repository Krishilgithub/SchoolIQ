import { PageHeader } from "@/components/super-admin/common/page-header";
import { GrowthChart } from "@/components/super-admin/analytics/growth-chart";
import { DemographicsChart } from "@/components/super-admin/analytics/demographics-chart";
import { EngagementStats } from "@/components/super-admin/analytics/engagement-stats";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { Download } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pt-2 pb-12 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <PageHeader
        title="Platform Analytics"
        description="Deep dive into user growth, engagement, and financial metrics."
      >
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker />
          <Button
            variant="outline"
            className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <GrowthChart />
        <DemographicsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <EngagementStats />
        {/* Could add another widget here, or make EngagementStats full width */}
      </div>
    </div>
  );
}
