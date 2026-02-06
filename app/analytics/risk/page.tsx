"use client";

import { RiskTable } from "@/components/analytics/widgets/risk-table";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

export default function RiskAnalysisPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Risk Intelligence
          </h2>
          <p className="text-muted-foreground">
            Early warning system identifying students at risk of academic or
            behavioral issues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" /> Configure Rules
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Manual Flag
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* We can reuse KPI cards here specifically for Risk Stats */}
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            High Risk Students
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">12</div>
          <div className="text-xs text-muted-foreground mt-1">+2 this week</div>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            At-Risk Cohort
          </div>
          <div className="text-2xl font-bold mt-2">8.5%</div>
          <div className="text-xs text-muted-foreground mt-1">
            vs 7.2% last term
          </div>
        </div>
      </div>

      <RiskTable />
    </div>
  );
}
