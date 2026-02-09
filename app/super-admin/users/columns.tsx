"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Define a custom type structure for the joined query results
export type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_super_admin: boolean | null;
  school_members: {
    role: string;
    school: {
      name: string;
    } | null;
  }[];
  created_at: string;
};

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-neutral-400 hover:text-white pl-0"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-white">
          {row.original.first_name} {row.original.last_name}
        </span>
        <span className="text-xs text-neutral-500">
          {row.getValue("email")}
        </span>
      </div>
    ),
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const isSuperAdmin = row.original.is_super_admin;
      const membership = row.original.school_members?.[0];

      if (isSuperAdmin) {
        return (
          <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50">
            <Shield className="w-3 h-3 mr-1" /> Super Admin
          </Badge>
        );
      }

      return (
        <Badge
          variant="outline"
          className="border-neutral-700 text-neutral-300"
        >
          {membership?.role || "User"}
        </Badge>
      );
    },
  },
  {
    id: "school",
    header: "School",
    cell: ({ row }) => {
      const membership = row.original.school_members?.[0];
      return (
        <div className="text-neutral-400 text-sm">
          {membership?.school?.name || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => (
      <div className="text-neutral-500 text-xs">
        {new Date(row.getValue("created_at")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
              onClick={() => navigator.clipboard.writeText(user.id)}
              className="focus:bg-neutral-800 focus:text-white cursor-pointer"
            >
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem className="text-orange-500 focus:bg-orange-950/20 focus:text-orange-400 cursor-pointer">
              Impersonate User
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-800 focus:text-white cursor-pointer">
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem className="text-red-500 focus:bg-red-950/20 focus:text-red-400 cursor-pointer">
              Lock Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
