"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  BookOpen,
  CalendarOff,
  FileText,
  History,
  Activity,
  Edit,
  Save,
  X,
  Plus,
  Star,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Teacher {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  nationality: string | null;
  department: string | null;
  designation: string | null;
  status: string;
  employment_type: string;
  date_of_joining: string | null;
  qualification: string | null;
  specialization: string | null;
  experience_years: number | null;
  current_workload_hours: number;
  max_workload_hours: number;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  profile_photo_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;

  assignments?: any[];
  leaves?: any[];
  leave_balances?: any[];
  performance_reviews?: any[];
  timetable_slots?: any[];
}

export default function TeacherProfileClient({
  teacherId,
}: {
  teacherId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedTeacher, setEditedTeacher] = useState<Partial<Teacher>>({});
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    fetchTeacher();
  }, [teacherId]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teachers/${teacherId}`);
      if (!response.ok) throw new Error("Failed to fetch teacher");

      const data = await response.json();
      setTeacher(data);
      setEditedTeacher(data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      toast.error("Failed to load teacher profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedTeacher),
      });

      if (!response.ok) throw new Error("Failed to update teacher");

      toast.success("Teacher profile updated successfully");
      setEditing(false);
      fetchTeacher();
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Failed to update teacher profile");
    }
  };

  const handleCancel = () => {
    setEditedTeacher(teacher as Teacher);
    setEditing(false);
  };

  const getWorkloadPercentage = () => {
    if (!teacher) return 0;
    return (teacher.current_workload_hours / teacher.max_workload_hours) * 100;
  };

  const getWorkloadStatus = () => {
    const percentage = getWorkloadPercentage();
    if (percentage >= 100)
      return { label: "Overloaded", color: "text-red-600" };
    if (percentage >= 80) return { label: "Optimal", color: "text-yellow-600" };
    return { label: "Available", color: "text-green-600" };
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading teacher profile...</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-muted-foreground">Teacher not found</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={teacher.profile_photo_url || ""} />
            <AvatarFallback className="text-2xl">
              {getInitials(teacher.first_name, teacher.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {teacher.first_name} {teacher.last_name}
            </h1>
            <p className="text-muted-foreground">
              {teacher.designation || "Teacher"} •{" "}
              {teacher.department || "General"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={teacher.status === "active" ? "default" : "secondary"}
              >
                {teacher.status}
              </Badge>
              <Badge variant="outline">{teacher.employment_type}</Badge>
              <Badge variant="outline" className={getWorkloadStatus().color}>
                {getWorkloadStatus().label} (
                {getWorkloadPercentage().toFixed(0)}%)
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Employee ID</Label>
                  <div className="font-mono font-medium">
                    {teacher.employee_id}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Email</Label>
                  {editing ? (
                    <Input
                      value={editedTeacher.email || ""}
                      onChange={(e) =>
                        setEditedTeacher({
                          ...editedTeacher,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {teacher.email}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Phone</Label>
                  {editing ? (
                    <Input
                      value={editedTeacher.phone || ""}
                      onChange={(e) =>
                        setEditedTeacher({
                          ...editedTeacher,
                          phone: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {teacher.phone || "-"}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Date of Birth</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {teacher.date_of_birth
                      ? format(new Date(teacher.date_of_birth), "PPP")
                      : "-"}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <div>{teacher.gender || "-"}</div>
                </div>

                <div className="grid gap-2">
                  <Label>Blood Group</Label>
                  <div>{teacher.blood_group || "-"}</div>
                </div>

                <div className="grid gap-2">
                  <Label>Nationality</Label>
                  <div>{teacher.nationality || "-"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Department</Label>
                  <div>{teacher.department || "-"}</div>
                </div>

                <div className="grid gap-2">
                  <Label>Designation</Label>
                  <div>{teacher.designation || "-"}</div>
                </div>

                <div className="grid gap-2">
                  <Label>Date of Joining</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {teacher.date_of_joining
                      ? format(new Date(teacher.date_of_joining), "PPP")
                      : "-"}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Experience</Label>
                  <div>
                    {teacher.experience_years
                      ? `${teacher.experience_years} years`
                      : "-"}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Qualification</Label>
                  <div>{teacher.qualification || "-"}</div>
                </div>

                <div className="grid gap-2">
                  <Label>Specialization</Label>
                  <div>{teacher.specialization || "-"}</div>
                </div>

                <div className="grid gap-2">
                  <Label>Employment Type</Label>
                  <Badge variant="outline">{teacher.employment_type}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>{teacher.address_line1 || "-"}</div>
                {teacher.address_line2 && <div>{teacher.address_line2}</div>}
                <div>
                  {[teacher.city, teacher.state, teacher.postal_code]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </div>
                <div>{teacher.country || "-"}</div>
              </CardContent>
            </Card>

            {/* Workload Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Workload Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Current Workload
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {teacher.current_workload_hours}/
                      {teacher.max_workload_hours} hours
                    </span>
                  </div>
                  <Progress value={getWorkloadPercentage()} className="h-2" />
                  <div className="mt-2 text-center">
                    <span
                      className={`text-2xl font-bold ${getWorkloadStatus().color}`}
                    >
                      {getWorkloadPercentage().toFixed(1)}%
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getWorkloadStatus().label}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {teacher.assignments?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Assignments
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {teacher.timetable_slots?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Weekly Periods
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Name</Label>
                    <div className="mt-1 font-medium">
                      {teacher.emergency_contact_name || "-"}
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <div className="mt-1 font-medium">
                      {teacher.emergency_contact_phone || "-"}
                    </div>
                  </div>
                  <div>
                    <Label>Relation</Label>
                    <div className="mt-1 font-medium">
                      {teacher.emergency_contact_relation || "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Assignments</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teacher.assignments && teacher.assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Weekly Periods</TableHead>
                      <TableHead>Workload Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacher.assignments.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.subject?.name}
                        </TableCell>
                        <TableCell>{assignment.class?.name}</TableCell>
                        <TableCell>{assignment.section?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assignment.assignment_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignment.weekly_periods}</TableCell>
                        <TableCell>{assignment.workload_hours}h</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assignment.is_active ? "default" : "secondary"
                            }
                          >
                            {assignment.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No assignments yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Timetable view will display weekly schedule with period details
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves" className="space-y-4">
          {/* Leave Balances */}
          <div className="grid gap-4 md:grid-cols-4">
            {teacher.leave_balances?.map((balance: any) => (
              <Card key={balance.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium capitalize">
                    {balance.leave_type.replace("_", " ")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balance.available}</div>
                  <p className="text-xs text-muted-foreground">
                    of {balance.total_allocated} days available
                  </p>
                  <Progress
                    value={(balance.available / balance.total_allocated) * 100}
                    className="mt-2 h-1"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leave History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leave History</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Request Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teacher.leaves && teacher.leaves.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacher.leaves.map((leave: any) => (
                      <TableRow key={leave.id}>
                        <TableCell className="capitalize">
                          {leave.leave_type.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(leave.start_date), "PP")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(leave.end_date), "PP")}
                        </TableCell>
                        <TableCell>{leave.total_days}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              leave.status === "approved"
                                ? "default"
                                : leave.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {leave.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leave history
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {teacher.performance_reviews &&
          teacher.performance_reviews.length > 0 ? (
            <>
              {/* Latest Review Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Latest Performance Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const latestReview = teacher.performance_reviews[0];
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Overall Rating
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <span className="text-2xl font-bold">
                                {latestReview.overall_rating?.toFixed(1) || "-"}
                              </span>
                              <span className="text-muted-foreground">
                                / 5.0
                              </span>
                            </div>
                          </div>
                          <Badge>{latestReview.review_type}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Teaching Effectiveness
                            </div>
                            <div className="font-medium">
                              {latestReview.teaching_effectiveness}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Subject Knowledge
                            </div>
                            <div className="font-medium">
                              {latestReview.subject_knowledge}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Classroom Management
                            </div>
                            <div className="font-medium">
                              {latestReview.classroom_management}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Student Engagement
                            </div>
                            <div className="font-medium">
                              {latestReview.student_engagement}/5
                            </div>
                          </div>
                        </div>

                        {latestReview.strengths && (
                          <div>
                            <div className="text-sm font-medium mb-1">
                              Strengths
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {latestReview.strengths}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Review History */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teacher.performance_reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {review.review_type} Review
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(review.reviewed_at), "PPP")}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {review.overall_rating?.toFixed(1) || "-"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rating
                            </div>
                          </div>
                          <Badge variant="outline">{review.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No performance reviews yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity timeline will show profile changes, assignment updates,
                status changes
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Workload Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workload Summary */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Current Workload
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {teacher.current_workload_hours} of{" "}
                        {teacher.max_workload_hours} hours per week
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold ${getWorkloadStatus().color}`}
                      >
                        {getWorkloadPercentage().toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getWorkloadStatus().label}
                      </div>
                    </div>
                  </div>
                  <Progress value={getWorkloadPercentage()} className="h-3" />
                </div>

                {/* Assignment Breakdown */}
                {teacher.assignments && teacher.assignments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      By Assignment
                    </h3>
                    <div className="space-y-2">
                      {teacher.assignments
                        .filter((a: any) => a.is_active)
                        .map((assignment: any) => (
                          <div
                            key={assignment.id}
                            className="flex items-center gap-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {assignment.subject?.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({assignment.class?.name}{" "}
                                  {assignment.section?.name})
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.weekly_periods} periods •{" "}
                                {assignment.workload_hours}h per week
                              </div>
                            </div>
                            <div className="w-32">
                              <Progress
                                value={
                                  (assignment.workload_hours /
                                    teacher.max_workload_hours) *
                                  100
                                }
                                className="h-2"
                              />
                            </div>
                            <div className="w-16 text-right text-sm font-medium">
                              {(
                                (assignment.workload_hours /
                                  teacher.max_workload_hours) *
                                100
                              ).toFixed(0)}
                              %
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
