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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

export interface DatabaseBackup {
  id: string;
  backup_type: "manual" | "scheduled" | "pre_migration";
  backup_size_bytes: number;
  backup_location: string;
  backup_status: "in_progress" | "completed" | "failed";
  error_message: string | null;
  created_by_name: string | null;
  created_at: string;
  completed_at: string | null;
  retention_days: number;
}

interface BackupsListProps {
  backups: DatabaseBackup[];
  onDownload: (backupId: string) => void;
  onRestore: (backupId: string) => void;
  onDelete: (backupId: string) => void;
}

const statusConfig = {
  in_progress: {
    icon: Loader2,
    color: "bg-blue-100 text-blue-800",
    label: "In Progress",
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
};

export function BackupsList({
  backups,
  onDownload,
  onRestore,
  onDelete,
}: BackupsListProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const columns: ColumnDef<DatabaseBackup>[] = [
    {
      accessorKey: "backup_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("backup_type") as string;
        const typeColors = {
          manual: "bg-blue-100 text-blue-800",
          scheduled: "bg-green-100 text-green-800",
          pre_migration: "bg-purple-100 text-purple-800",
        };
        return (
          <Badge
            variant="outline"
            className={typeColors[type as keyof typeof typeColors]}
          >
            {type.replace("_", " ").toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "backup_size_bytes",
      header: "Size",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {formatBytes(row.getValue("backup_size_bytes"))}
        </div>
      ),
    },
    {
      accessorKey: "backup_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue(
          "backup_status",
        ) as DatabaseBackup["backup_status"];
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={config.color}>
            <Icon
              className={`mr-1 h-3 w-3 ${
                status === "in_progress" ? "animate-spin" : ""
              }`}
            />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_by_name",
      header: "Created By",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("created_by_name") || "System"}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("created_at")).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "retention_days",
      header: "Retention",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("retention_days")} days</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const backup = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {backup.backup_status === "completed" && (
                <>
                  <DropdownMenuItem onClick={() => onDownload(backup.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRestore(backup.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(backup.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: backups,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
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
                  No backups found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {backups.length} backup{backups.length !== 1 ? "s" : ""}
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
