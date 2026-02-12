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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CalendarOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  Download,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Leave {
  id: string;
  teacher: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string | null;
    profile_photo_url: string | null;
  };
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  has_conflicts: boolean;
  conflict_details: any[];
  substitute_teacher: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  reviewed_at: string | null;
  requested_at: string;
}

interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  totalDays: number;
  byType: Record<string, number>;
}

interface SubstituteCandidate {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  current_workload_hours: number;
  max_workload_hours: number;
  matchScore: number;
  reasonsForMatch: string[];
}

export default function LeaveManagement() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [stats, setStats] = useState<LeaveStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    totalDays: 0,
    byType: {},
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [conflictsOnlyFilter, setConflictsOnlyFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [substituteDialogOpen, setSubstituteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [substituteCandidates, setSubstituteCandidates] = useState<
    SubstituteCandidate[]
  >([]);
  const [selectedSubstitute, setSelectedSubstitute] = useState<string>("");
  const [substituteNotes, setSubstituteNotes] = useState("");

  useEffect(() => {
    fetchStats();
    fetchPendingLeaves();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [page, statusFilter, leaveTypeFilter, conflictsOnlyFilter, searchTerm]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/leaves?action=stats");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const response = await fetch("/api/leaves?action=pending");
      if (!response.ok) throw new Error("Failed to fetch pending leaves");

      const data = await response.json();
      setPendingLeaves(data);
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter) params.append("status", statusFilter);
      if (leaveTypeFilter) params.append("leaveType", leaveTypeFilter);
      if (conflictsOnlyFilter) params.append("hasConflicts", "true");

      const response = await fetch(`/api/leaves?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch leaves");

      const data = await response.json();
      setLeaves(data.leaves);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubstituteCandidates = async (leaveId: string) => {
    try {
      const response = await fetch("/api/teachers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "find_substitutes", leaveId }),
      });

      if (!response.ok)
        throw new Error("Failed to fetch substitute candidates");

      const data = await response.json();
      setSubstituteCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load substitute candidates");
    }
  };

  const handleReviewClick = (leave: Leave, action: "approve" | "reject") => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewNotes("");

    // If approving and has conflicts, show substitute dialog
    if (action === "approve" && leave.has_conflicts) {
      fetchSubstituteCandidates(leave.id);
      setSubstituteDialogOpen(true);
    } else {
      setReviewDialogOpen(true);
    }
  };

  const handleReview = async () => {
    if (!selectedLeave || !reviewAction) return;

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          leaveId: selectedLeave.id,
          notes: reviewNotes,
          substituteTeacherId: selectedSubstitute || undefined,
          substituteNotes: substituteNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process leave");
      }

      toast.success(`Leave ${reviewAction}d successfully`);
      setReviewDialogOpen(false);
      setSubstituteDialogOpen(false);
      fetchLeaves();
      fetchPendingLeaves();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Failed to process leave");
    }
  };

  const handleViewDetails = (leave: Leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
  };

  const getLeaveTypeBadge = (type: string) => {
    const colorMap: Record<string, string> = {
      sick: "bg-red-100 text-red-800",
      casual: "bg-blue-100 text-blue-800",
      earned: "bg-green-100 text-green-800",
      maternity: "bg-purple-100 text-purple-800",
      paternity: "bg-indigo-100 text-indigo-800",
      unpaid: "bg-gray-100 text-gray-800",
      compensatory: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge variant="secondary" className={colorMap[type] || ""}>
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; className: string }> = {
      pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      approved: { icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { icon: XCircle, className: "bg-red-100 text-red-800" },
      cancelled: { icon: XCircle, className: "bg-gray-100 text-gray-800" },
    };

    const { icon: Icon, className } = config[status] || config.pending;

    return (
      <Badge variant="secondary" className={className}>
        <Icon className="mr-1 h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
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
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            Manage teacher leave requests and assignments
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDays} days total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On Leave Today
            </CardTitle>
            <CalendarOff className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                leaves.filter((l) => {
                  const today = new Date().toISOString().split("T")[0];
                  return (
                    l.status === "approved" &&
                    l.start_date <= today &&
                    l.end_date >= today
                  );
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Currently away</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals - Priority Section */}
      {pendingLeaves.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Approvals ({pendingLeaves.length})
                </CardTitle>
                <CardDescription>
                  Review and approve leave requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar>
                      <AvatarImage
                        src={leave.teacher.profile_photo_url || ""}
                      />
                      <AvatarFallback>
                        {getInitials(
                          leave.teacher.first_name,
                          leave.teacher.last_name,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {leave.teacher.first_name} {leave.teacher.last_name}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({leave.teacher.employee_id})
                        </span>
                        {leave.teacher.department && (
                          <Badge variant="outline">
                            {leave.teacher.department}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(leave.start_date), "PP")} -{" "}
                          {format(new Date(leave.end_date), "PP")}
                        </span>
                        <span>•</span>
                        <span>{leave.total_days} days</span>
                        <span>•</span>
                        {getLeaveTypeBadge(leave.leave_type)}
                      </div>
                      {leave.has_conflicts && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {leave.conflict_details.length} Conflicts Detected
                          </Badge>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => handleViewDetails(leave)}
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewClick(leave, "reject")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReviewClick(leave, "approve")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Leave Requests</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={leaveTypeFilter}
                onValueChange={setLeaveTypeFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="paternity">Paternity</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="compensatory">Compensatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading leave requests...
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leave requests found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conflicts</TableHead>
                    <TableHead>Substitute</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={leave.teacher.profile_photo_url || ""}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(
                                leave.teacher.first_name,
                                leave.teacher.last_name,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {leave.teacher.first_name}{" "}
                              {leave.teacher.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {leave.teacher.employee_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLeaveTypeBadge(leave.leave_type)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{format(new Date(leave.start_date), "PP")}</div>
                        <div className="text-xs text-muted-foreground">
                          to {format(new Date(leave.end_date), "PP")}
                        </div>
                      </TableCell>
                      <TableCell>{leave.total_days}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        {leave.has_conflicts ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {leave.conflict_details.length}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            None
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {leave.substitute_teacher ? (
                          <div className="text-sm">
                            {leave.substitute_teacher.first_name}{" "}
                            {leave.substitute_teacher.last_name}
                          </div>
                        ) : leave.status === "approved" &&
                          leave.has_conflicts ? (
                          <Badge variant="outline" className="text-xs">
                            Not Assigned
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(leave)}
                        >
                          View Details
                        </Button>
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

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              {selectedLeave &&
                `${selectedLeave.teacher.first_name} ${selectedLeave.teacher.last_name} - ${selectedLeave.total_days} days`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notes {reviewAction === "reject" && "(Required)"}</Label>
              <Textarea
                placeholder={`Add ${reviewAction === "approve" ? "approval" : "rejection"} notes...`}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReview}>
              {reviewAction === "approve" ? "Approve" : "Reject"} Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substitute Assignment Dialog */}
      <Dialog
        open={substituteDialogOpen}
        onOpenChange={setSubstituteDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Conflicts Detected - Assign Substitute
            </DialogTitle>
            <DialogDescription>
              This leave has conflicts with timetable or exams. A substitute
              teacher must be assigned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLeave?.conflict_details &&
              selectedLeave.conflict_details.length > 0 && (
                <div className="space-y-2">
                  <Label>Detected Conflicts</Label>
                  <div className="space-y-2">
                    {selectedLeave.conflict_details.map(
                      (conflict: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive" className="text-xs">
                              {conflict.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium capitalize">
                              {conflict.type}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {conflict.message}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            <div className="space-y-2">
              <Label>Select Substitute Teacher</Label>
              <Select
                value={selectedSubstitute}
                onValueChange={setSelectedSubstitute}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a substitute..." />
                </SelectTrigger>ft behind
                <SelectContent>
                  {substituteCandidates
                    .filter(
                      (candidate) => candidate.id && candidate.id.trim() !== "",
                    )
                    .map((candidate) => {
                      const workloadPercentage =
                        (candidate.current_workload_hours /
                          candidate.max_workload_hours) *
                        100;
                      return (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {candidate.first_name} {candidate.last_name} (
                              {candidate.employee_id})
                            </span>
                            <span className="ml-4 text-xs text-muted-foreground">
                              {workloadPercentage.toFixed(0)}% workload • Match:{" "}
                              {candidate.matchScore}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {selectedSubstitute && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium mb-1">
                    Why this substitute?
                  </div>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {substituteCandidates
                      .find((c) => c.id === selectedSubstitute)
                      ?.reasonsForMatch.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes for Substitute</Label>
              <Textarea
                placeholder="Add any special instructions for the substitute teacher..."
                value={substituteNotes}
                onChange={(e) => setSubstituteNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Approval Notes</Label>
              <Textarea
                placeholder="Add approval notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubstituteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={!selectedSubstitute}>
              <UserPlus className="mr-2 h-4 w-4" />
              Approve & Assign Substitute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teacher</Label>
                  <div className="mt-1 font-medium">
                    {selectedLeave.teacher.first_name}{" "}
                    {selectedLeave.teacher.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedLeave.teacher.employee_id}
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <div className="mt-1">
                    {selectedLeave.teacher.department || "-"}
                  </div>
                </div>
                <div>
                  <Label>Leave Type</Label>
                  <div className="mt-1">
                    {getLeaveTypeBadge(selectedLeave.leave_type)}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="mt-1 font-medium">
                    {selectedLeave.total_days} days
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedLeave.start_date), "PP")} -{" "}
                    {format(new Date(selectedLeave.end_date), "PP")}
                  </div>
                </div>
                {selectedLeave.substitute_teacher && (
                  <div>
                    <Label>Substitute</Label>
                    <div className="mt-1 font-medium">
                      {selectedLeave.substitute_teacher.first_name}{" "}
                      {selectedLeave.substitute_teacher.last_name}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Reason</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {selectedLeave.reason}
                </div>
              </div>

              {selectedLeave.has_conflicts &&
                selectedLeave.conflict_details.length > 0 && (
                  <div>
                    <Label>
                      Conflicts ({selectedLeave.conflict_details.length})
                    </Label>
                    <div className="mt-1 space-y-2">
                      {selectedLeave.conflict_details.map(
                        (conflict: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="destructive" className="text-xs">
                                {conflict.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium capitalize">
                                {conflict.type}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {conflict.message}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
