import { FilterDrawer } from "@/components/analytics/filters/filter-drawer";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { KPIGrid } from "@/components/analytics/widgets/kpi-grid";
import { PerformanceHeatmap } from "@/components/analytics/widgets/performance-heatmap";

export default function AnalyticsOverview() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Academic Performance
          </h2>
          <p className="text-muted-foreground">
            Overview of school-wide metrics and student success.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterDrawer />
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <KPIGrid />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PerformanceHeatmap />

        {/* Placeholder for Trend Line till implemented */}
        <div className="col-span-full lg:col-span-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center min-h-[300px] bg-slate-50 dark:bg-slate-900/50">
          <p className="text-muted-foreground text-sm font-medium">
            Multi-Year Trend Analysis (Coming Soon)
          </p>
        </div>
      </div>
    </div>
  );
}
