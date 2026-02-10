"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

export interface BackgroundJob {
  id: string;
  job_name: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  priority: number;
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface JobsQueueProps {
  jobs: BackgroundJob[];
  onViewDetails: (jobId: string) => void;
  onRetryJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending",
  },
  running: {
    icon: Loader2,
    color: "bg-blue-100 text-blue-800",
    label: "Running",
  },
  completed: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    label: "Failed",
  },
  cancelled: {
    icon: XCircle,
    color: "bg-gray-100 text-gray-800",
    label: "Cancelled",
  },
};

export function JobsQueue({
  jobs,
  onViewDetails,
  onRetryJob,
  onCancelJob,
}: JobsQueueProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<BackgroundJob>[] = [
    {
      accessorKey: "job_name",
      header: "Job",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("job_name")}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {row.original.job_type}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as BackgroundJob["status"];
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={config.color}>
            <Icon
              className={`mr-1 h-3 w-3 ${status === "running" ? "animate-spin" : ""}`}
            />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as number;
        return (
          <Badge
            variant="outline"
            className={
              priority > 5
                ? "bg-red-100 text-red-800"
                : priority > 2
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
            }
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "attempts",
      header: "Attempts",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="text-sm">
            {job.attempts}/{job.max_attempts}
          </div>
        );
      },
    },
    {
      accessorKey: "scheduled_at",
      header: "Scheduled",
      cell: ({ row }) => {
        const scheduled = row.getValue("scheduled_at") as string | null;
        return scheduled ? (
          <div className="text-sm">{new Date(scheduled).toLocaleString()}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Now</div>
        );
      },
    },
    {
      accessorKey: "started_at",
      header: "Started",
      cell: ({ row }) => {
        const started = row.getValue("started_at") as string | null;
        return started ? (
          <div className="text-sm">
            {new Date(started).toLocaleTimeString()}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">-</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(job.id)}>
                View Details
              </DropdownMenuItem>
              {job.status === "failed" && (
                <DropdownMenuItem onClick={() => onRetryJob(job.id)}>
                  Retry Job
                </DropdownMenuItem>
              )}
              {(job.status === "pending" || job.status === "running") && (
                <DropdownMenuItem
                  onClick={() => onCancelJob(job.id)}
                  className="text-red-600"
                >
                  Cancel Job
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {jobs.length}{" "}
          jobs
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
