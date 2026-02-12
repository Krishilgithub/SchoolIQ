"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Download,
  Upload,
  FileText,
  Activity,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  History,
  Users,
  Heart,
  Home,
  Briefcase,
  Bus,
  Award,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentProfileClientProps {
  studentId: string;
}

export default function StudentProfileClient({
  studentId,
}: StudentProfileClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock schoolId - replace with actual from context/session
  const schoolId = "mock-school-id";

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Fetch student details
      const studentResponse = await fetch(
        `/api/students/${studentId}?schoolId=${schoolId}`,
      );
      const studentData = await studentResponse.json();
      setStudent(studentData);

      // Fetch documents
      const docsResponse = await fetch(
        `/api/students/${studentId}/documents?schoolId=${schoolId}`,
      );
      const docsData = await docsResponse.json();
      setDocuments(Array.isArray(docsData) ? docsData : []);

      // Fetch discipline records
      const disciplineResponse = await fetch(
        `/api/students/${studentId}/discipline?schoolId=${schoolId}`,
      );
      const disciplineData = await disciplineResponse.json();
      setDisciplineRecords(Array.isArray(disciplineData) ? disciplineData : []);

      // Fetch history
      const historyResponse = await fetch(
        `/api/students/${studentId}/history?schoolId=${schoolId}&limit=20`,
      );
      const historyData = await historyResponse.json();
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!student) return "ST";
    return `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      transferred_out: "bg-blue-100 text-blue-800",
      graduated: "bg-purple-100 text-purple-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Student Not Found
        </h2>
        <p className="text-gray-500 mb-4">
          The student you're looking for doesn't exist.
        </p>
        <Link href="/school-admin/students">
          <Button>Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-500 mt-1">
            Complete 360° view of student information
          </p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Student Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.profile_photo_url} />
              <AvatarFallback className="text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {student.first_name} {student.middle_name}{" "}
                    {student.last_name}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Admission No: {student.admission_number}
                  </p>
                </div>
                {getStatusBadge(student.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    DOB: {new Date(student.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 capitalize">
                    {student.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {student.class_name} {student.section_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Roll: {student.current_enrollment?.roll_number || "N/A"}
                  </span>
                </div>
              </div>

              {student.blood_group && (
                <div className="flex items-center gap-2 mt-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">
                    Blood Group: {student.blood_group}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="discipline">Discipline</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="First Name" value={student.first_name} />
                <InfoRow
                  label="Middle Name"
                  value={student.middle_name || "N/A"}
                />
                <InfoRow label="Last Name" value={student.last_name} />
                <InfoRow
                  label="Date of Birth"
                  value={new Date(student.date_of_birth).toLocaleDateString()}
                />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow
                  label="Blood Group"
                  value={student.blood_group || "N/A"}
                />
                <InfoRow
                  label="Nationality"
                  value={student.nationality || "N/A"}
                />
                <InfoRow label="Religion" value={student.religion || "N/A"} />
                <InfoRow
                  label="Mother Tongue"
                  value={student.mother_tongue || "N/A"}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="Contact Name"
                  value={student.emergency_contact_name || "N/A"}
                />
                <InfoRow
                  label="Phone"
                  value={student.emergency_contact_phone || "N/A"}
                />
                <InfoRow
                  label="Relation"
                  value={student.emergency_contact_relation || "N/A"}
                />
                {student.allergies && student.allergies.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Allergies:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {student.allergies.map((allergy: string, i: number) => (
                        <Badge key={i} variant="outline">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {student.chronic_conditions &&
                  student.chronic_conditions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Chronic Conditions:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {student.chronic_conditions.map(
                          (condition: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-yellow-50"
                            >
                              {condition}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                {student.medical_notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Medical Notes:
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {student.medical_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.student_profiles && (
                  <>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Current Address:
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {student.student_profiles.current_address_line1}
                        {student.student_profiles.current_address_line2 &&
                          `, ${student.student_profiles.current_address_line2}`}
                        <br />
                        {student.student_profiles.current_city},{" "}
                        {student.student_profiles.current_state}{" "}
                        {student.student_profiles.current_postal_code}
                        <br />
                        {student.student_profiles.current_country}
                      </p>
                    </div>
                    <InfoRow
                      label="Transport Required"
                      value={
                        student.student_profiles.transport_required
                          ? "Yes"
                          : "No"
                      }
                    />
                    {student.student_profiles.transport_required && (
                      <>
                        <InfoRow
                          label="Bus Route"
                          value={student.student_profiles.bus_route || "N/A"}
                        />
                        <InfoRow
                          label="Pickup Point"
                          value={student.student_profiles.pickup_point || "N/A"}
                        />
                      </>
                    )}
                    <InfoRow
                      label="Hostel Resident"
                      value={
                        student.student_profiles.hostel_resident ? "Yes" : "No"
                      }
                    />
                    {student.student_profiles.hostel_resident && (
                      <InfoRow
                        label="Room Number"
                        value={
                          student.student_profiles.hostel_room_number || "N/A"
                        }
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="Admission Number"
                  value={student.admission_number}
                />
                <InfoRow
                  label="Enrollment Date"
                  value={new Date(student.enrollment_date).toLocaleDateString()}
                />
                <InfoRow
                  label="Current Class"
                  value={student.class_name || "N/A"}
                />
                <InfoRow
                  label="Section"
                  value={student.section_name || "N/A"}
                />
                <InfoRow
                  label="Roll Number"
                  value={student.current_enrollment?.roll_number || "N/A"}
                />
                {student.student_profiles && (
                  <>
                    <InfoRow
                      label="Previous School"
                      value={
                        student.student_profiles.previous_school_name || "N/A"
                      }
                    />
                    <InfoRow
                      label="TC Number"
                      value={
                        student.student_profiles.transfer_certificate_number ||
                        "N/A"
                      }
                    />
                    {student.student_profiles.has_special_needs && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Special Needs:
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {student.student_profiles.special_needs_description}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Attendance tracking to be integrated
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This will show daily attendance, percentage, and trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Performance Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Academic records to be integrated
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This will show grades, exam results, and performance trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Assignment tracking to be integrated
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This will show assignment submissions, scores, and pending
                  work
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Vault ({documents.length})
                </CardTitle>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.document_type.replace("_", " ")} •{" "}
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discipline Tab */}
        <TabsContent value="discipline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Discipline Records ({disciplineRecords.length})
                </CardTitle>
                <Button size="sm">Add Record</Button>
              </div>
            </CardHeader>
            <CardContent>
              {disciplineRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No discipline records - Excellent behavior!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disciplineRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={
                                record.severity === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : record.severity === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : record.severity === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                              }
                            >
                              {record.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(
                                record.incident_date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium capitalize">
                            {record.incident_type.replace("_", " ")}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {record.incident_description}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Action: {record.action_taken}
                          </p>
                        </div>
                        <Badge
                          variant={
                            record.resolution_status === "resolved"
                              ? "default"
                              : "outline"
                          }
                        >
                          {record.resolution_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                        {index < history.length - 1 && (
                          <div className="w-px h-full bg-gray-300 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{item.change_description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {item.change_type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Parent / Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.student_profiles && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Father Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Father's Details
                    </h3>
                    <InfoRow
                      label="Name"
                      value={student.student_profiles.father_name || "N/A"}
                    />
                    <InfoRow
                      label="Occupation"
                      value={
                        student.student_profiles.father_occupation || "N/A"
                      }
                    />
                    <InfoRow
                      label="Phone"
                      value={student.student_profiles.father_phone || "N/A"}
                    />
                    <InfoRow
                      label="Email"
                      value={student.student_profiles.father_email || "N/A"}
                    />
                  </div>

                  {/* Mother Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mother's Details
                    </h3>
                    <InfoRow
                      label="Name"
                      value={student.student_profiles.mother_name || "N/A"}
                    />
                    <InfoRow
                      label="Occupation"
                      value={
                        student.student_profiles.mother_occupation || "N/A"
                      }
                    />
                    <InfoRow
                      label="Phone"
                      value={student.student_profiles.mother_phone || "N/A"}
                    />
                    <InfoRow
                      label="Email"
                      value={student.student_profiles.mother_email || "N/A"}
                    />
                  </div>

                  {/* Guardian Info (if different) */}
                  {student.student_profiles.guardian_name && (
                    <div className="space-y-3 md:col-span-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Guardian's Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InfoRow
                          label="Name"
                          value={student.student_profiles.guardian_name}
                        />
                        <InfoRow
                          label="Relation"
                          value={
                            student.student_profiles.guardian_relation || "N/A"
                          }
                        />
                        <InfoRow
                          label="Phone"
                          value={
                            student.student_profiles.guardian_phone || "N/A"
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Parent Links from API */}
              {student.parent_links && student.parent_links.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">
                    Registered Parent Accounts
                  </h3>
                  <div className="space-y-2">
                    {student.parent_links.map((link: any) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{link.parent_name}</p>
                          <p className="text-sm text-gray-500">
                            {link.parent_email} • {link.parent_phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {link.relation}
                          </Badge>
                          {link.is_primary && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for displaying info rows
function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
