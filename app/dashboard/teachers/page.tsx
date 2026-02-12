"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  CalendarOff,
  Download,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  status: "active" | "on_leave" | "suspended" | "terminated";
  employment_type: "full_time" | "part_time" | "contract" | "guest";
  current_workload_hours: number;
  max_workload_hours: number;
  profile_photo_url: string | null;
  date_of_joining: string | null;
  experience_years: number | null;
}

interface TeacherStats {
  total: number;
  active: number;
  on_leave: number;
  terminated: number;
}

export default function TeachersDirectory() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    total: 0,
    active: 0,
    on_leave: 0,
    terminated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [workloadStatusFilter, setWorkloadStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/teachers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" }),
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (departmentFilter) params.append("department", departmentFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (employmentTypeFilter)
        params.append("employmentType", employmentTypeFilter);
      if (workloadStatusFilter)
        params.append("workloadStatus", workloadStatusFilter);

      const response = await fetch(`/api/teachers?${params.toString()}`);

      if (!response.ok) throw new Error("Failed to fetch teachers");

      const data = await response.json();
      setTeachers(data.teachers);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [
    page,
    searchTerm,
    departmentFilter,
    statusFilter,
    employmentTypeFilter,
    workloadStatusFilter,
  ]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
    setEmploymentTypeFilter("");
    setWorkloadStatusFilter("");
    setPage(1);
  };

  const getWorkloadBadge = (teacher: Teacher) => {
    const percentage =
      (teacher.current_workload_hours / teacher.max_workload_hours) * 100;

    if (percentage >= 100) {
      return (
        <Badge variant="destructive" className="font-medium">
          Overloaded {percentage.toFixed(0)}%
        </Badge>
      );
    } else if (percentage >= 80) {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 font-medium"
        >
          Optimal {percentage.toFixed(0)}%
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 font-medium"
        >
          Available {percentage.toFixed(0)}%
        </Badge>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeMap: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      on_leave: { variant: "secondary", label: "On Leave" },
      suspended: { variant: "destructive", label: "Suspended" },
      terminated: { variant: "outline", label: "Terminated" },
    };

    const config = badgeMap[status] || badgeMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete teacher");
      }

      toast.success("Teacher deleted successfully");
      fetchTeachers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete teacher");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teachers Directory
          </h1>
          <p className="text-muted-foreground">
            Manage your teaching staff and monitor workload
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/teachers/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All teaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently teaching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <CalendarOff className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.on_leave}</div>
            <p className="text-xs text-muted-foreground">Temporarily away</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Workload
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.active > 0
                ? (
                    teachers.reduce(
                      (sum, t) =>
                        sum +
                        (t.current_workload_hours / t.max_workload_hours) * 100,
                      0,
                    ) / teachers.length || 0
                  ).toFixed(0)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Capacity utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Search & Filter</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {(searchTerm ||
              departmentFilter ||
              statusFilter ||
              employmentTypeFilter ||
              workloadStatusFilter) && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Physical Education">
                    Physical Education
                  </SelectItem>
                  <SelectItem value="Computer Science">
                    Computer Science
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={employmentTypeFilter}
                onValueChange={setEmploymentTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={workloadStatusFilter}
                onValueChange={setWorkloadStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Workload Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Workloads</SelectItem>
                  <SelectItem value="available">Available (&lt;80%)</SelectItem>
                  <SelectItem value="optimal">Optimal (80-100%)</SelectItem>
                  <SelectItem value="overloaded">
                    Overloaded (&gt;100%)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teachers ({teachers.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading teachers...
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Workload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-mono text-sm">
                        {teacher.employee_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={teacher.profile_photo_url || ""}
                            />
                            <AvatarFallback>
                              {getInitials(
                                teacher.first_name,
                                teacher.last_name,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {teacher.first_name} {teacher.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.department || "-"}</TableCell>
                      <TableCell>{teacher.designation || "-"}</TableCell>
                      <TableCell>{getWorkloadBadge(teacher)}</TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/teachers/${teacher.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/teachers/${teacher.id}/edit`,
                                )
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/teachers/${teacher.id}?tab=assignments`,
                                )
                              }
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Manage Assignments
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(teacher.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
