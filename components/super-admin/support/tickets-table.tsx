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
  type ColumnFiltersState,
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
} from "lucide-react";

export interface Ticket {
  id: string;
  subject: string;
  school_name: string;
  user_name: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketsTableProps {
  tickets: Ticket[];
  onViewDetails: (ticketId: string) => void;
  onAssign: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, status: Ticket["status"]) => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  waiting: "bg-yellow-100 text-yellow-800",
  resolved: "bg-purple-100 text-purple-800",
  closed: "bg-gray-100 text-gray-800",
};

export function TicketsTable({
  tickets,
  onViewDetails,
  onAssign,
  onUpdateStatus,
}: TicketsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{row.getValue("subject")}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.school_name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "user_name",
      header: "Reporter",
      cell: ({ row }) => <div>{row.getValue("user_name")}</div>,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as Ticket["priority"];
        return (
          <Badge variant="outline" className={priorityColors[priority]}>
            {priority.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Ticket["status"];
        return (
          <Badge variant="outline" className={statusColors[status]}>
            {status.replace("_", " ").toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "assigned_to",
      header: "Assigned To",
      cell: ({ row }) => (
        <div>
          {row.getValue("assigned_to") || (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(ticket.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssign(ticket.id)}>
                Assign
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(ticket.id, "in_progress")}
              >
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(ticket.id, "resolved")}
              >
                Mark Resolved
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(ticket.id, "closed")}
              >
                Close Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={
              (table.getColumn("subject")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("subject")?.setFilterValue(event.target.value)
            }
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
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {tickets.length}{" "}
          tickets
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
