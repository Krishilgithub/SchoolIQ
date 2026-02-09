import { Server, Activity, Database, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemHealth {
  database: string;
  apiLatency: number;
  storageUsage: number;
}

export function HealthWidget({ health }: { health: SystemHealth }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading">
          System Health
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
          Operational
        </span>
      </div>

      <div className="space-y-6 flex-1">
        {/* Database Status */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Database className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">Database</p>
              <span
                className={cn(
                  "text-xs font-bold",
                  health.database === "healthy"
                    ? "text-emerald-500"
                    : "text-red-500",
                )}
              >
                {health.database === "healthy" ? "Healthy" : "Issues"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">PostgreSQL Cluster</p>
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

        {/* Storage Usage */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">Storage</p>
              <span className="text-xs font-bold text-foreground">
                {health.storageUsage}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${health.storageUsage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
          View System Logs
        </button>
      </div>
    </div>
  );
}
