"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";

// Type alias for readability
type School = Database["public"]["Tables"]["schools"]["Row"];

export const columns: ColumnDef<School>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-neutral-400 hover:text-white pl-0"
        >
          School Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-white">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Subdomain",
    cell: ({ row }) => (
      <div className="text-neutral-400">
        {row.getValue("slug")}.schooliq.com
      </div>
    ),
  },
  {
    accessorKey: "subscription_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("subscription_status") as string;
      return (
        <Badge
          variant="outline"
          className={
            status === "active"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : status === "trial"
                ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                : status === "past_due"
                  ? "border-orange-500/20 bg-orange-500/10 text-orange-500"
                  : "border-red-500/20 bg-red-500/10 text-red-500"
          }
        >
          {status?.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contact_email",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-neutral-400 text-xs">
        {row.getValue("contact_email")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      return (
        <div className="text-neutral-500 text-xs">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const school = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-neutral-900 border-neutral-800 text-neutral-200"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(school.id)}
              className="focus:bg-neutral-800 focus:text-white cursor-pointer"
            >
              Copy School ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem className="focus:bg-neutral-800 focus:text-white cursor-pointer">
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-800 focus:text-white cursor-pointer">
              Manage Quotas
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem className="text-red-500 focus:bg-red-950/20 focus:text-red-400 cursor-pointer">
              Suspend School
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
