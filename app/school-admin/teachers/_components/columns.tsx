"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Teacher } from "@/lib/types/teacher";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { deleteTeacherAction } from "@/lib/actions/teacher-actions";
import { useToast } from "@/components/ui/use-toast";

export const columns: ColumnDef<Teacher>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("full_name")}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("specialization") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    cell: ({ row }) => row.getValue("phone_number") || "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original;
      const { toast } = useToast();

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this teacher?")) return;
        try {
          await deleteTeacherAction(teacher.id);
          toast({
            title: "Teacher deleted",
            variant: "success",
          });
        } catch (error) {
          toast({
            title: "Error deleting teacher",
            description: "Please try again later",
            variant: "destructive",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/school-admin/teachers/${teacher.id}`}>
              <DropdownMenuItem>View details</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Delete teacher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
