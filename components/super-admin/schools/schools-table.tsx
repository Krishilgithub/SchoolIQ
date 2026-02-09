"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Building2,
  ShieldAlert,
  Trash2,
  Eye,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Using the same type as dashboard for now, but could be specific
export interface SchoolTableItem {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  subscription_status: string;
  created_at: string;
  school_admins: { count: number }[];
}

interface SchoolsTableProps {
  data: SchoolTableItem[];
}

export function SchoolsTable({ data }: SchoolsTableProps) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[300px]">School</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-slate-500"
              >
                No schools found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((school) => (
              <TableRow
                key={school.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-100">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${school.id}.png`}
                      />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600">
                        {school.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {school.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {school.contact_email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      school.subscription_status === "active"
                        ? "default"
                        : school.subscription_status === "canceled"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      school.subscription_status === "active"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none border-0"
                        : school.subscription_status === "canceled"
                          ? "bg-red-100 text-red-700 hover:bg-red-200 shadow-none border-0"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none border-0"
                    }
                  >
                    {school.subscription_status.charAt(0).toUpperCase() +
                      school.subscription_status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">
                      {school.school_admins && school.school_admins[0]
                        ? school.school_admins[0].count
                        : 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-slate-600 border-slate-200 font-normal"
                  >
                    Standard
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-slate-500">
                  {new Date(school.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/super-admin/schools/${school.id}`}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer">
                        <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
