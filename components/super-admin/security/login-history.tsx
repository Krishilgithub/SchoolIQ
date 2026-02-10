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
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason: string | null;
  location: {
    city?: string;
    country?: string;
  } | null;
  attempted_at: string;
}

interface LoginHistoryProps {
  attempts: LoginAttempt[];
}

export function LoginHistory({ attempts }: LoginHistoryProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "attempted_at", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<LoginAttempt>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "success",
      header: "Status",
      cell: ({ row }) => {
        const success = row.getValue("success") as boolean;
        return success ? (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Success
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      },
    },
    {
      accessorKey: "ip_address",
      header: "IP Address",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("ip_address")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("location") as LoginAttempt["location"];
        return location ? (
          <div className="text-sm">
            {location.city}, {location.country}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Unknown</div>
        );
      },
    },
    {
      accessorKey: "user_agent",
      header: "Device",
      cell: ({ row }) => {
        const ua = row.getValue("user_agent") as string;
        const device = ua.includes("Mobile") ? "Mobile" : "Desktop";
        const browser =
          ua.match(/Chrome|Firefox|Safari|Edge|Opera/)?.[0] || "Unknown";
        return (
          <div className="text-sm">
            {device} • {browser}
          </div>
        );
      },
    },
    {
      accessorKey: "failure_reason",
      header: "Failure Reason",
      cell: ({ row }) => {
        const reason = row.getValue("failure_reason") as string | null;
        return reason ? (
          <div className="text-sm text-red-600">{reason}</div>
        ) : (
          <div className="text-sm text-muted-foreground">-</div>
        );
      },
    },
    {
      accessorKey: "attempted_at",
      header: "Time",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("attempted_at")).toLocaleString()}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: attempts,
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

  const successCount = attempts.filter((a) => a.success).length;
  const failureCount = attempts.filter((a) => !a.success).length;
  const successRate = attempts.length
    ? ((successCount / attempts.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Attempts</p>
          <p className="text-2xl font-bold">{attempts.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Successful</p>
          <p className="text-2xl font-bold text-green-600">{successCount}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failureCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search login attempts..."
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
                  No login attempts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Success rate: {successRate}%
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
