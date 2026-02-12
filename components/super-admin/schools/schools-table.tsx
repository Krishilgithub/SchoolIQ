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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Building2,
  ShieldAlert,
  Trash2,
  Eye,
  VenetianMask,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { toast } from "sonner";
import React from "react";

import {
  impersonateUserAction,
  suspendSchoolAction,
  deleteSchoolAction,
} from "@/app/super-admin/actions";
import { useRouter } from "next/navigation";

// Using the same type as dashboard for now, but could be specific
export interface SchoolTableItem {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  subscription_status: string;
  created_at: string;
  school_admins: { user_id: string; role: string }[];
}

interface SchoolsTableProps {
  data: SchoolTableItem[];
}

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SchoolsTable({ data }: SchoolsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suspendDialogOpen, setSuspendDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] =
    React.useState<SchoolTableItem | null>(null);
  const router = useRouter();

  const handleImpersonate = async (school: SchoolTableItem) => {
    // Find the first admin user
    const adminUser = school.school_admins.find((admin) => admin.user_id);

    if (!adminUser || !adminUser.user_id) {
      toast.error("No admin user found for this school to impersonate.");
      return;
    }

    toast.promise(
      async () => {
        const result = await impersonateUserAction(adminUser.user_id);
        if (!result.success) throw new Error(result.error);
        if (result.data?.redirectUrl) {
          router.push(result.data.redirectUrl);
        }
        return "Impersonation link generated! Redirecting...";
      },
      {
        loading: "Generating impersonation session...",
        success: (msg) => msg,
        error: (err) => `Failed to impersonate: ${err.message}`,
      },
    );
  };

  const handleSuspend = async () => {
    if (!selectedSchool) return;

    toast.promise(
      async () => {
        const result = await suspendSchoolAction(selectedSchool.id);
        if (!result.success) throw new Error(result.error);
        setSuspendDialogOpen(false);
        setSelectedSchool(null);
        router.refresh();
        return "School suspended successfully";
      },
      {
        loading: "Suspending school...",
        success: (msg) => msg,
        error: (err) => `Failed to suspend school: ${err}`,
      },
    );
  };

  const handleDelete = async () => {
    if (!selectedSchool) return;

    toast.promise(
      async () => {
        const result = await deleteSchoolAction(selectedSchool.id);
        if (!result.success) throw new Error(result.error);
        setDeleteDialogOpen(false);
        setSelectedSchool(null);
        router.refresh();
        return "School deleted successfully";
      },
      {
        loading: "Deleting school...",
        success: (msg) => msg,
        error: (err) => `Failed to delete school: ${err}`,
      },
    );
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(
      (school) =>
        school.name.toLowerCase().includes(lowerQuery) ||
        school.contact_email.toLowerCase().includes(lowerQuery),
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Search schools..."
          className="pl-9 bg-white border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  {searchQuery
                    ? "No matching schools found."
                    : "No schools found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((school) => (
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
                        <AvatarFallback className="bg-orange-50 text-orange-600">
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
                        {school.school_admins ? school.school_admins.length : 0}
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
                    {new Date(school.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
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
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/super-admin/schools/${school.id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleImpersonate(school)}
                          className="cursor-pointer"
                        >
                          <VenetianMask className="mr-2 h-4 w-4" /> Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSchool(school);
                            setSuspendDialogOpen(true);
                          }}
                          className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSchool(school);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
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

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend{" "}
              <strong>{selectedSchool?.name}</strong>? This will set the
              subscription status to canceled and may affect all users
              associated with this school.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSchool(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Suspend School
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{selectedSchool?.name}</strong>? This action cannot be
              undone and will remove all data associated with this school
              including users, students, and records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSchool(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
