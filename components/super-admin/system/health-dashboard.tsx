"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsChart } from "./metrics-chart";
import { ServiceStatus } from "./service-status";
import { AlertsPanel } from "./alerts-panel";

interface MetricDataPoint {
  timestamp: string;
  api_latency: number;
  db_load: number;
  memory_usage: number;
  cpu_usage: number;
  error_rate: number;
}

interface Service {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
  lastChecked: string;
}

interface Alert {
  id: string;
  type: "info" | "warning" | "error" | "critical";
  message: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
}

interface HealthDashboardProps {
  metricsData: MetricDataPoint[];
  services: Service[];
  alerts: Alert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
}

export function HealthDashboard({
  metricsData,
  services,
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
}: HealthDashboardProps) {
  // Calculate current metrics (latest data point)
  const latestMetrics = metricsData[metricsData.length - 1];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.api_latency.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.db_load.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.memory_usage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">System memory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.error_rate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <ServiceStatus services={services} />

      {/* Metrics Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricsChart
          data={metricsData}
          metric="api_latency"
          title="API Latency"
          unit="ms"
          color="#8b5cf6"
        />
        <MetricsChart
          data={metricsData}
          metric="db_load"
          title="Database Load"
          unit="%"
          color="#3b82f6"
        />
        <MetricsChart
          data={metricsData}
          metric="memory_usage"
          title="Memory Usage"
          unit="%"
          color="#f59e0b"
        />
        <MetricsChart
          data={metricsData}
          metric="cpu_usage"
          title="CPU Usage"
          unit="%"
          color="#10b981"
        />
      </div>

      {/* Alerts Panel */}
      <AlertsPanel
        alerts={alerts}
        onAcknowledge={onAcknowledgeAlert}
        onResolve={onResolveAlert}
      />
    </div>
  );
}
