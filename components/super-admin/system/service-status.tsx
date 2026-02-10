"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface Service {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
  lastChecked: string;
}

interface ServiceStatusProps {
  services: Service[];
}

const statusConfig = {
  operational: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    label: "Operational",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    label: "Degraded",
  },
  down: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    label: "Down",
  },
};

export function ServiceStatus({ services }: ServiceStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Service Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => {
            const config = statusConfig[service.status];
            const Icon = config.icon;

            return (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last checked:{" "}
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.uptime}%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${config.bgColor} ${config.textColor}`}
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
