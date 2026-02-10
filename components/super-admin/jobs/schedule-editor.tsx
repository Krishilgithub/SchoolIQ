"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface JobSchedule {
  id: string;
  job_type: string;
  schedule_cron: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
}

interface ScheduleEditorProps {
  schedules: JobSchedule[];
  onToggleSchedule: (scheduleId: string, active: boolean) => void;
  onEditSchedule: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export function ScheduleEditor({
  schedules,
  onToggleSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: ScheduleEditorProps) {
  const handleToggle = async (scheduleId: string, active: boolean) => {
    try {
      await onToggleSchedule(scheduleId, active);
      toast.success(active ? "Schedule activated" : "Schedule paused");
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  const parseCron = (cron: string) => {
    // Simple cron parser for display
    const parts = cron.split(" ");
    if (cron === "0 0 * * *") return "Daily at midnight";
    if (cron === "0 * * * *") return "Every hour";
    if (cron === "*/5 * * * *") return "Every 5 minutes";
    if (cron === "0 0 * * 0") return "Weekly on Sunday";
    return cron;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Job Schedules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No scheduled jobs configured
            </p>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{schedule.job_type}</h4>
                    {schedule.is_active && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Schedule: {parseCron(schedule.schedule_cron)}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {schedule.last_run_at && (
                      <span>
                        Last run:{" "}
                        {new Date(schedule.last_run_at).toLocaleString()}
                      </span>
                    )}
                    {schedule.next_run_at && (
                      <span>
                        Next run:{" "}
                        {new Date(schedule.next_run_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={(checked: boolean) =>
                      handleToggle(schedule.id, checked)
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSchedule(schedule.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
