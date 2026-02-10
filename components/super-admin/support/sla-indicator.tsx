"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SLAIndicatorProps {
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  resolvedAt?: string;
}

const SLA_TARGETS = {
  critical: { response: 1, resolution: 4 }, // hours
  high: { response: 2, resolution: 8 },
  medium: { response: 4, resolution: 24 },
  low: { response: 8, resolution: 48 },
};

export function SLAIndicator({
  priority,
  createdAt,
  resolvedAt,
}: SLAIndicatorProps) {
  const created = new Date(createdAt);
  const now = new Date();
  const resolved = resolvedAt ? new Date(resolvedAt) : null;

  const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  const resolutionTime = resolved
    ? (resolved.getTime() - created.getTime()) / (1000 * 60 * 60)
    : null;

  const target = SLA_TARGETS[priority];
  const responseTarget = target.response;
  const resolutionTarget = target.resolution;

  const responseStatus = hoursElapsed <= responseTarget ? "met" : "breached";
  const resolutionStatus = resolved
    ? resolutionTime! <= resolutionTarget
      ? "met"
      : "breached"
    : hoursElapsed <= resolutionTarget
      ? "on-track"
      : "at-risk";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "met":
        return "bg-green-100 text-green-800";
      case "on-track":
        return "bg-blue-100 text-blue-800";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800";
      case "breached":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "met":
        return <CheckCircle2 className="h-4 w-4" />;
      case "at-risk":
      case "breached":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          SLA Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">First Response Time</span>
            <Badge variant="outline" className={getStatusColor(responseStatus)}>
              {getStatusIcon(responseStatus)}
              <span className="ml-1">
                {responseStatus === "met" ? "Met" : "Breached"}
              </span>
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Target: {responseTarget}h | Elapsed: {hoursElapsed.toFixed(1)}h
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                responseStatus === "met" ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${Math.min((hoursElapsed / responseTarget) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Resolution Time</span>
            <Badge
              variant="outline"
              className={getStatusColor(resolutionStatus)}
            >
              {getStatusIcon(resolutionStatus)}
              <span className="ml-1 capitalize">
                {resolutionStatus.replace("-", " ")}
              </span>
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Target: {resolutionTarget}h |{" "}
            {resolved
              ? `Resolved in ${resolutionTime!.toFixed(1)}h`
              : `Elapsed: ${hoursElapsed.toFixed(1)}h`}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                resolutionStatus === "met"
                  ? "bg-green-500"
                  : resolutionStatus === "on-track"
                    ? "bg-blue-500"
                    : resolutionStatus === "at-risk"
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
              style={{
                width: `${Math.min(
                  ((resolved ? resolutionTime! : hoursElapsed) /
                    resolutionTarget) *
                    100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Priority</p>
              <p className="font-medium capitalize">{priority}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">
                {resolved ? "Resolved" : "In Progress"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
