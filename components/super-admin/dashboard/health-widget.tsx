import { Activity, Database, HardDrive, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformHealth } from "@/lib/services/super-admin";

export function HealthWidget({ health }: { health: PlatformHealth }) {
  // Determine overall database health based on metrics
  const isDatabaseHealthy = health.errorRate < 5 && health.dbLoad < 80;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading">
          System Health
        </h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            isDatabaseHealthy
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-yellow-500/10 text-yellow-500",
          )}
        >
          {isDatabaseHealthy ? "Operational" : "Degraded"}
        </span>
      </div>

      <div className="space-y-6 flex-1">
        {/* Database Load */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Database className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">
                Database Load
              </p>
              <span
                className={cn(
                  "text-xs font-bold",
                  health.dbLoad < 70
                    ? "text-emerald-500"
                    : health.dbLoad < 85
                      ? "text-yellow-500"
                      : "text-red-500",
                )}
              >
                {health.dbLoad}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  health.dbLoad < 70
                    ? "bg-emerald-500"
                    : health.dbLoad < 85
                      ? "bg-yellow-500"
                      : "bg-red-500",
                )}
                style={{ width: `${health.dbLoad}%` }}
              />
            </div>
          </div>
        </div>

        {/* API Latency */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">API Latency</p>
              <span className="text-xs font-bold text-foreground">
                {health.apiLatency}ms
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Average Response Time
            </p>
          </div>
        </div>

        {/* Error Rate */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">Error Rate</p>
              <span
                className={cn(
                  "text-xs font-bold",
                  health.errorRate < 1
                    ? "text-emerald-500"
                    : health.errorRate < 5
                      ? "text-yellow-500"
                      : "text-red-500",
                )}
              >
                {health.errorRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Failed Requests</p>
          </div>
        </div>

        {/* Storage Usage - only show if available */}
        {health.storageUsage !== undefined && (
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <HardDrive className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Storage</p>
                <span className="text-xs font-bold text-foreground">
                  {health.storageUsage} GB
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Database Size</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
          View System Logs
        </button>
      </div>
    </div>
  );
}
