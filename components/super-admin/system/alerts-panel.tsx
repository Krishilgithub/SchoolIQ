"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, AlertTriangle, Info, XCircle } from "lucide-react";
import { toast } from "sonner";

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

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

const alertConfig = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  error: {
    icon: XCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
};

export function AlertsPanel({
  alerts,
  onAcknowledge,
  onResolve,
}: AlertsPanelProps) {
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const acknowledgedAlerts = alerts.filter((a) => a.status === "acknowledged");

  const handleAcknowledge = (alertId: string) => {
    onAcknowledge(alertId);
    toast.success("Alert acknowledged");
  };

  const handleResolve = (alertId: string) => {
    onResolve(alertId);
    toast.success("Alert resolved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </span>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            {activeAlerts.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-100 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No alerts</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${
                    alert.status === "resolved" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <Badge
                          variant="outline"
                          className={`${config.bgColor} ${config.textColor} text-xs`}
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.metric_name}: {alert.current_value} (threshold:{" "}
                        {alert.threshold_value})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                      {alert.status === "active" && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                      {alert.status === "acknowledged" && (
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800"
                          >
                            Acknowledged
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                      {alert.status === "resolved" && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
