"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Type alias
type AuditLog = {
  id: string;
  operation: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  changed_by: {
    email: string;
  } | null;
  created_at: string;
  school: {
    name: string;
  } | null;
};

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-neutral-400 hover:text-white pl-0"
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-neutral-300 font-mono text-xs">
        {new Date(row.getValue("created_at")).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "operation",
    header: "Action",
    cell: ({ row }) => {
      const op = row.getValue("operation") as string;
      return (
        <Badge
          variant="outline"
          className={
            op === "INSERT"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : op === "UPDATE"
                ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                : op === "DELETE"
                  ? "border-red-500/20 bg-red-500/10 text-red-500"
                  : "text-neutral-500"
          }
        >
          {op}
        </Badge>
      );
    },
  },
  {
    accessorKey: "table_name",
    header: "Resource",
    cell: ({ row }) => (
      <div className="text-neutral-400 font-mono text-xs">
        {row.getValue("table_name")}
      </div>
    ),
  },
  {
    id: "user",
    header: "Actor",
    cell: ({ row }) => (
      <div className="text-neutral-300 text-sm">
        {row.original.changed_by?.email || "System"}
      </div>
    ),
  },
  {
    id: "school",
    header: "Context",
    cell: ({ row }) => (
      <div className="text-neutral-500 text-sm">
        {row.original.school?.name || "Global"}
      </div>
    ),
  },
];
