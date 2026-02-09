"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformHealth as PlatformHealthType } from "@/lib/api/admin-mock";
import { Activity, Database, Server, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformHealthProps {
  data: PlatformHealthType;
}

export function PlatformHealthWidget({ data }: PlatformHealthProps) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <Activity className="h-4 w-4" /> Platform Health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Latency */}
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-3 w-3" /> API Latency
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">
              {Math.round(data.apiLatency)}
            </span>
            <span className="text-xs text-muted-foreground">ms</span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full transition-all duration-500",
                data.apiLatency > 150 ? "bg-red-500" : "bg-emerald-500",
              )}
              style={{
                width: `${Math.min((data.apiLatency / 200) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* DB Load */}
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="h-3 w-3" /> DB Load
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">
              {Math.round(data.dbLoad)}
            </span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full transition-all duration-500",
                data.dbLoad > 80 ? "bg-red-500" : "bg-blue-500",
              )}
              style={{ width: `${data.dbLoad}%` }}
            />
          </div>
        </div>

        {/* Error Rate */}
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" /> Error Rate
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">
              {data.errorRate.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full transition-all duration-500",
                data.errorRate > 1 ? "bg-red-500" : "bg-emerald-500",
              )}
              style={{ width: `${Math.min(data.errorRate * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Queue Depth */}
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-3 w-3" /> Queue Depth
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">
              {data.queueDepth}
            </span>
            <span className="text-xs text-muted-foreground">jobs</span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${Math.min((data.queueDepth / 100) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
