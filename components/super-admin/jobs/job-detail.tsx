"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileJson, RefreshCw } from "lucide-react";
import type { BackgroundJob } from "./jobs-queue";

interface JobDetailProps {
  job: BackgroundJob & {
    payload: Record<string, any>;
    stack_trace: string | null;
  };
  onRetry: () => void;
}

export function JobDetail({ job, onRetry }: JobDetailProps) {
  const statusConfig = {
    pending: "bg-yellow-100 text-yellow-800",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const duration =
    job.started_at && job.completed_at
      ? Math.round(
          (new Date(job.completed_at).getTime() -
            new Date(job.started_at).getTime()) /
            1000,
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{job.job_name}</h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {job.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusConfig[job.status]}>
            {job.status.toUpperCase()}
          </Badge>
          {job.status === "failed" && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium font-mono">{job.job_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority:</span>
              <Badge
                variant="outline"
                className={
                  job.priority > 5
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {job.priority}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attempts:</span>
              <span className="font-medium">
                {job.attempts}/{job.max_attempts}
              </span>
            </div>
            {duration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{duration}s</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(job.created_at).toLocaleString()}
              </span>
            </div>
            {job.scheduled_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="font-medium">
                  {new Date(job.scheduled_at).toLocaleString()}
                </span>
              </div>
            )}
            {job.started_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started:</span>
                <span className="font-medium">
                  {new Date(job.started_at).toLocaleString()}
                </span>
              </div>
            )}
            {job.completed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {new Date(job.completed_at).toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Payload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <pre className="text-xs font-mono">
              {JSON.stringify(job.payload, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {job.error_message && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Error Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-900 font-medium">
              {job.error_message}
            </p>
          </CardContent>
        </Card>
      )}

      {job.stack_trace && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stack Trace</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {job.stack_trace}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
