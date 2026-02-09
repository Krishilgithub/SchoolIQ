"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlatformHealth } from "@/lib/services/super-admin";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, Database, Server } from "lucide-react";

interface PlatformHealthWidgetProps {
  data: PlatformHealth;
}

export function PlatformHealthWidget({ data }: PlatformHealthWidgetProps) {
  // Helpers to determine color based on thresholds
  const getStatusColor = (
    value: number,
    type: "latency" | "load" | "error",
  ) => {
    if (type === "latency")
      return value > 200
        ? "bg-red-500"
        : value > 100
          ? "bg-yellow-500"
          : "bg-emerald-500";
    if (type === "load")
      return value > 80
        ? "bg-red-500"
        : value > 60
          ? "bg-yellow-500"
          : "bg-emerald-500";
    if (type === "error")
      return value > 1
        ? "bg-red-500"
        : value > 0.5
          ? "bg-yellow-500"
          : "bg-emerald-500";
    return "bg-emerald-500";
  };

  return (
    <Card className="col-span-3 border-slate-200/60 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          Platform Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Latency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Server className="h-4 w-4" />
              <span>API Latency</span>
            </div>
            <span className="font-medium text-slate-900">
              {Math.round(data.apiLatency)}ms
            </span>
          </div>
          <Progress
            value={Math.min(data.apiLatency / 3, 100)}
            className="h-2"
            indicatorClassName={getStatusColor(data.apiLatency, "latency")}
          />
        </div>

        {/* DB Load */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Database className="h-4 w-4" />
              <span>Database Load</span>
            </div>
            <span className="font-medium text-slate-900">
              {Math.round(data.dbLoad)}%
            </span>
          </div>
          <Progress
            value={data.dbLoad}
            className="h-2"
            indicatorClassName={getStatusColor(data.dbLoad, "load")}
          />
        </div>

        {/* Error Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertCircle className="h-4 w-4" />
              <span>Error Rate</span>
            </div>
            <span
              className={cn(
                "font-medium",
                data.errorRate > 1 ? "text-red-600" : "text-slate-900",
              )}
            >
              {data.errorRate.toFixed(2)}%
            </span>
          </div>
          <Progress
            value={data.errorRate * 20}
            className="h-2"
            indicatorClassName={getStatusColor(data.errorRate, "error")}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              System Status
            </p>
            <p className="text-green-600 font-bold mt-1">Operational</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Last Backup
            </p>
            <p className="text-slate-700 font-bold mt-1">2 hours ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
