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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  UserCog,
  ShieldAlert,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SuperAdminUser } from "@/lib/services/super-admin";
import { useState } from "react";

interface UsersTableProps {
  data: SuperAdminUser[];
}

export function UsersTable({ data }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Client-side filtering for MVP smoothness
  const filteredData = data.filter((user) => {
    const fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());

    // Determine effective role for filtering
    let userRole = "student"; // Default
    if (user.is_super_admin) userRole = "super_admin";
    else if (user.school_admins && user.school_admins.length > 0) {
      userRole = user.school_admins[0].role;
    }

    const roleMatch = roleFilter === "all" || userRole === roleFilter;

    return searchMatch && roleMatch;
  });

  const getUserRoleLabel = (user: SuperAdminUser) => {
    if (user.is_super_admin)
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 shadow-none">
          Super Admin
        </Badge>
      );
    if (user.school_admins && user.school_admins.length > 0) {
      const role = user.school_admins[0].role;
      if (role === "admin" || role === "school_admin")
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 shadow-none">
            School Admin
          </Badge>
        );
      if (role === "teacher")
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 shadow-none">
            Teacher
          </Badge>
        );
    }
    // Default fallback (though schema might differ)
    return (
      <Badge variant="outline" className="text-slate-600">
        User
      </Badge>
    );
  };

  const getUserSchool = (user: SuperAdminUser) => {
    if (user.is_super_admin) return "Global";
    if (
      user.school_admins &&
      user.school_admins.length > 0 &&
      user.school_admins[0].schools
    ) {
      return user.school_admins[0].schools.name;
    }
    return "N/A";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <SelectValue placeholder="Filter by Role" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="school_admin">School Admin</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-orange-100">
                        <AvatarImage
                          src={
                            user.avatar_url ||
                            `https://avatar.vercel.sh/${user.id}`
                          }
                        />
                        <AvatarFallback className="bg-orange-50 text-orange-600">
                          {(user.first_name?.[0] || "") +
                            (user.last_name?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getUserRoleLabel(user)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      {getUserSchool(user)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_suspended ? "destructive" : "secondary"}
                      className={
                        user.is_suspended
                          ? "bg-red-100 text-red-700 hover:bg-red-200 shadow-none border-0"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none border-0"
                      }
                    >
                      {user.is_suspended ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem className="cursor-pointer">
                          <UserCog className="mr-2 h-4 w-4" /> Manage Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          {user.is_suspended ? "Unsuspend" : "Suspend"}
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
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Showing {filteredData.length} users
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
