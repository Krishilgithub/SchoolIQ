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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Flag,
} from "lucide-react";
import { toast } from "sonner";

export interface FeatureFlag {
  id: string;
  flag_key: string;
  flag_name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_schools: string[];
  target_users: string[];
  created_at: string;
  updated_at: string;
}

interface FlagsTableProps {
  flags: FeatureFlag[];
  onToggleFlag: (flagId: string, enabled: boolean) => void;
  onEditFlag: (flagId: string) => void;
  onViewHistory: (flagId: string) => void;
  onDeleteFlag: (flagId: string) => void;
}

export function FlagsTable({
  flags,
  onToggleFlag,
  onEditFlag,
  onViewHistory,
  onDeleteFlag,
}: FlagsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const handleToggle = async (flagId: string, enabled: boolean) => {
    try {
      await onToggleFlag(flagId, enabled);
      toast.success(enabled ? "Flag enabled" : "Flag disabled");
    } catch (error) {
      toast.error("Failed to update flag");
    }
  };

  const columns: ColumnDef<FeatureFlag>[] = [
    {
      accessorKey: "flag_name",
      header: "Feature Flag",
      cell: ({ row }) => (
        <div className="max-w-62.5">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{row.getValue("flag_name")}</p>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {row.original.flag_key}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-75 truncate text-sm">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "is_enabled",
      header: "Status",
      cell: ({ row }) => {
        const enabled = row.getValue("is_enabled") as boolean;
        return (
          <Badge
            variant="outline"
            className={
              enabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }
          >
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rollout_percentage",
      header: "Rollout",
      cell: ({ row }) => {
        const percentage = row.getValue("rollout_percentage") as number;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-25">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium">{percentage}%</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "target_schools",
      header: "Targets",
      cell: ({ row }) => {
        const schools = row.getValue("target_schools") as string[];
        const users = row.original.target_users;
        const totalTargets = schools.length + users.length;
        return totalTargets > 0 ? (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {totalTargets} target{totalTargets !== 1 ? "s" : ""}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">All users</span>
        );
      },
    },
    {
      accessorKey: "is_enabled",
      id: "toggle",
      header: "Enable",
      cell: ({ row }) => {
        const flag = row.original;
        return (
          <Switch
            checked={flag.is_enabled}
            onCheckedChange={(checked: boolean) =>
              handleToggle(flag.id, checked)
            }
          />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const flag = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditFlag(flag.id)}>
                Edit Flag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory(flag.id)}>
                View History
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteFlag(flag.id)}
                className="text-red-600"
              >
                Delete Flag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: flags,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
  });

  const enabledCount = flags.filter((f) => f.is_enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feature flags..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {enabledCount} of {flags.length} enabled
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
                  No feature flags found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
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
  );
}
