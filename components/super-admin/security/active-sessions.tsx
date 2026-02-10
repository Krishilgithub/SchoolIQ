"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
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
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";

export interface ActiveSession {
  id: string;
  user_email: string;
  user_name: string;
  ip_address: string;
  user_agent: string;
  location: {
    city?: string;
    country?: string;
  } | null;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

interface ActiveSessionsProps {
  sessions: ActiveSession[];
  onTerminateSession: (sessionId: string) => void;
}

export function ActiveSessions({
  sessions,
  onTerminateSession,
}: ActiveSessionsProps) {
  const columns: ColumnDef<ActiveSession>[] = [
    {
      accessorKey: "user_name",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("user_name")}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.user_email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "user_agent",
      header: "Device",
      cell: ({ row }) => {
        const ua = row.getValue("user_agent") as string;
        const isMobile = ua.includes("Mobile");
        const browser =
          ua.match(/Chrome|Firefox|Safari|Edge|Opera/)?.[0] || "Unknown";
        return (
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Monitor className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm">{browser}</p>
              <p className="text-xs text-muted-foreground">
                {isMobile ? "Mobile" : "Desktop"}
              </p>
            </div>
          </div>
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
        const location = row.getValue("location") as ActiveSession["location"];
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
      accessorKey: "last_activity",
      header: "Last Activity",
      cell: ({ row }) => {
        const lastActivity = new Date(row.getValue("last_activity"));
        const now = new Date();
        const diffMinutes = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60),
        );
        return (
          <div className="text-sm">
            {diffMinutes < 1 ? "Just now" : `${diffMinutes}m ago`}
          </div>
        );
      },
    },
    {
      accessorKey: "expires_at",
      header: "Expires",
      cell: ({ row }) => {
        const expires = new Date(row.getValue("expires_at"));
        const now = new Date();
        const hoursLeft = Math.floor(
          (expires.getTime() - now.getTime()) / (1000 * 60 * 60),
        );
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {hoursLeft}h left
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onTerminateSession(session.id)}
          >
            Terminate
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
                  No active sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
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
