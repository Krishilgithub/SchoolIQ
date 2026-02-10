"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRecentActivities } from "@/lib/services/dashboard";
import type { ActivityItem } from "@/lib/types/dashboard";
import { formatDistanceToNow } from "date-fns";
import {
  UserPlus,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RecentActivityProps {
  schoolId: string;
}

const actionIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  create: UserPlus,
  update: Settings,
  delete: FileText,
  student: UserPlus,
  teacher: GraduationCap,
  class: BookOpen,
  exam: Calendar,
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-600",
  update: "bg-blue-100 text-blue-600",
  delete: "bg-red-100 text-red-600",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getActionIcon(action: string, resourceType: string) {
  const Icon = actionIcons[resourceType] || actionIcons[action] || FileText;
  return Icon;
}

function getActionColor(action: string): string {
  return actionColors[action] || "bg-gray-100 text-gray-600";
}

function formatAction(action: string, resourceType: string): string {
  const actionMap: Record<string, string> = {
    create: "created",
    update: "updated",
    delete: "deleted",
    insert: "added",
  };

  const verb = actionMap[action.toLowerCase()] || action;
  return `${verb} ${resourceType}`;
}

export function RecentActivity({ schoolId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await getRecentActivities(schoolId, 10);
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();

    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [schoolId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/school-admin/settings/audit-logs">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActionIcon(
                activity.action,
                activity.resourceType,
              );
              const colorClass = getActionColor(activity.action);

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userName}</span>{" "}
                      <span className="text-gray-600">
                        {formatAction(activity.action, activity.resourceType)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
