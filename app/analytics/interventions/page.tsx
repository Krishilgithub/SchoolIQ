"use client";

import { InterventionTracker } from "@/components/analytics/widgets/intervention-tracker";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function InterventionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Intervention Plans
          </h2>
          <p className="text-muted-foreground">
            Track and manage student support plans.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> New Plan
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-4">Active Cases</h3>
          <InterventionTracker />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Summary</h3>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Total Active</span>
              <span className="font-bold">24</span>
            </div>
            <div className="flex justify-between">
              <span>Needs Review</span>
              <span className="font-bold text-orange-600">5</span>
            </div>
            <div className="flex justify-between">
              <span>Completed (Term)</span>
              <span className="font-bold text-green-600">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
