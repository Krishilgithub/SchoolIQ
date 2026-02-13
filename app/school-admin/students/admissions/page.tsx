"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Upload,
  FileSpreadsheet,
  Users,
  ArrowUpCircle,
  Archive,
  School,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdmissionsTransfersPage() {
  const [activeTab, setActiveTab] = useState("new-admission");
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkPromoteClass, setBulkPromoteClass] = useState("");

  // Mock schoolId - replace with actual from context/session
  const schoolId = "mock-school-id";

  // New Admission Form State
  const [admissionForm, setAdmissionForm] = useState({
    // Student Basic Info
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    nationality: "Indian",
    mother_tongue: "",
    religion: "",
    email: "",

    // Admission Details
    admission_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    class_id: "",
    section_id: "",
    roll_number: "",

    // Parent/Guardian Info
    father_name: "",
    father_phone: "",
    father_email: "",
    father_occupation: "",
    mother_name: "",
    mother_phone: "",
    mother_email: "",
    mother_occupation: "",
    guardian_name: "",
    guardian_relation: "",
    guardian_phone: "",

    // Emergency Contact
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",

    // Address
    current_address_line1: "",
    current_address_line2: "",
    current_city: "",
    current_state: "",
    current_postal_code: "",
    current_country: "India",

    // Transport & Hostel
    transport_required: false,
    bus_route: "",
    pickup_point: "",
    hostel_resident: false,
    hostel_room_number: "",

    // Medical Info
    allergies: "",
    chronic_conditions: "",
    medical_notes: "",

    // Previous School (if transfer)
    is_transfer: false,
    previous_school_name: "",
    previous_class: "",
    transfer_certificate_number: "",
    leaving_date: "",

    // Special Needs
    has_special_needs: false,
    special_needs_description: "",
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    student_id: "",
    transfer_type: "within_school", // within_school or external
    from_class_id: "",
    from_section_id: "",
    to_class_id: "",
    to_section_id: "",
    effective_date: new Date().toISOString().split("T")[0],
    reason: "",
    tc_issued: false,
    tc_number: "",
  });

  useEffect(() => {
    loadClasses();
    loadStudents();
  }, []);

  const loadClasses = async () => {
    // Mock data - replace with actual API call
    setClasses([
      { id: "1", name: "Class 1" },
      { id: "2", name: "Class 2" },
      { id: "3", name: "Class 3" },
      { id: "4", name: "Class 4" },
      { id: "5", name: "Class 5" },
    ]);
    setSections([
      { id: "1", name: "Section A" },
      { id: "2", name: "Section B" },
      { id: "3", name: "Section C" },
    ]);
  };

  const loadStudents = async () => {
    try {
      const response = await fetch(
        `/api/students?schoolId=${schoolId}&status=active&limit=100`,
      );
      const data = await response.json();
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API
      const studentData = {
        school_id: schoolId,
        first_name: admissionForm.first_name,
        middle_name: admissionForm.middle_name,
        last_name: admissionForm.last_name,
        date_of_birth: admissionForm.date_of_birth,
        gender: admissionForm.gender,
        email: admissionForm.email,
        admission_number: admissionForm.admission_number,
        admission_date: admissionForm.admission_date,
        blood_group: admissionForm.blood_group,
        nationality: admissionForm.nationality,
        mother_tongue: admissionForm.mother_tongue,
        religion: admissionForm.religion,
        emergency_contact_name: admissionForm.emergency_contact_name,
        emergency_contact_phone: admissionForm.emergency_contact_phone,
        emergency_contact_relation: admissionForm.emergency_contact_relation,
        allergies: admissionForm.allergies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        chronic_conditions: admissionForm.chronic_conditions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        medical_notes: admissionForm.medical_notes,
      };

      const profileData = {
        father_name: admissionForm.father_name,
        father_phone: admissionForm.father_phone,
        father_email: admissionForm.father_email,
        father_occupation: admissionForm.father_occupation,
        mother_name: admissionForm.mother_name,
        mother_phone: admissionForm.mother_phone,
        mother_email: admissionForm.mother_email,
        mother_occupation: admissionForm.mother_occupation,
        guardian_name: admissionForm.guardian_name,
        guardian_relation: admissionForm.guardian_relation,
        guardian_phone: admissionForm.guardian_phone,
        current_address_line1: admissionForm.current_address_line1,
        current_address_line2: admissionForm.current_address_line2,
        current_city: admissionForm.current_city,
        current_state: admissionForm.current_state,
        current_postal_code: admissionForm.current_postal_code,
        current_country: admissionForm.current_country,
        transport_required: admissionForm.transport_required,
        bus_route: admissionForm.bus_route,
        pickup_point: admissionForm.pickup_point,
        hostel_resident: admissionForm.hostel_resident,
        hostel_room_number: admissionForm.hostel_room_number,
        has_special_needs: admissionForm.has_special_needs,
        special_needs_description: admissionForm.special_needs_description,
        previous_school_name: admissionForm.is_transfer
          ? admissionForm.previous_school_name
          : null,
        previous_class: admissionForm.is_transfer
          ? admissionForm.previous_class
          : null,
        transfer_certificate_number: admissionForm.is_transfer
          ? admissionForm.transfer_certificate_number
          : null,
      };

      const enrollmentData = {
        class_id: admissionForm.class_id,
        section_id: admissionForm.section_id,
        roll_number: admissionForm.roll_number,
        enrollment_date: admissionForm.admission_date,
      };

      // Call admitStudent API
      const response = await fetch(`/api/enrollments?schoolId=${schoolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admit",
          student: studentData,
          profile: profileData,
          enrollment: enrollmentData,
        }),
      });

      if (!response.ok) throw new Error("Failed to admit student");

      setShowSuccessDialog(true);

      // Reset form
      setAdmissionForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        nationality: "Indian",
        mother_tongue: "",
        religion: "",
        email: "",
        admission_number: "",
        admission_date: new Date().toISOString().split("T")[0],
        class_id: "",
        section_id: "",
        roll_number: "",
        father_name: "",
        father_phone: "",
        father_email: "",
        father_occupation: "",
        mother_name: "",
        mother_phone: "",
        mother_email: "",
        mother_occupation: "",
        guardian_name: "",
        guardian_relation: "",
        guardian_phone: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relation: "",
        current_address_line1: "",
        current_address_line2: "",
        current_city: "",
        current_state: "",
        current_postal_code: "",
        current_country: "India",
        transport_required: false,
        bus_route: "",
        pickup_point: "",
        hostel_resident: false,
        hostel_room_number: "",
        allergies: "",
        chronic_conditions: "",
        medical_notes: "",
        is_transfer: false,
        previous_school_name: "",
        previous_class: "",
        transfer_certificate_number: "",
        leaving_date: "",
        has_special_needs: false,
        special_needs_description: "",
      });
    } catch (error) {
      console.error("Error admitting student:", error);
      alert("Failed to admit student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/enrollments?schoolId=${schoolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:
            transferForm.transfer_type === "external" ? "withdraw" : "transfer",
          studentId: transferForm.student_id,
          newClassId: transferForm.to_class_id,
          newSectionId: transferForm.to_section_id,
          effectiveDate: transferForm.effective_date,
          reason: transferForm.reason,
          leavingCertificateIssued: transferForm.tc_issued,
          leavingCertificateNumber: transferForm.tc_number,
        }),
      });

      if (!response.ok) throw new Error("Failed to process transfer");

      setShowSuccessDialog(true);
      setTransferForm({
        student_id: "",
        transfer_type: "within_school",
        from_class_id: "",
        from_section_id: "",
        to_class_id: "",
        to_section_id: "",
        effective_date: new Date().toISOString().split("T")[0],
        reason: "",
        tc_issued: false,
        tc_number: "",
      });
      loadStudents(); // Reload to reflect changes
    } catch (error) {
      console.error("Error processing transfer:", error);
      alert("Failed to process transfer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPromote = async () => {
    if (selectedStudents.length === 0 || !bulkPromoteClass) {
      alert("Please select students and target class");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/students/bulk?schoolId=${schoolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promote",
          studentIds: selectedStudents,
          newClassId: bulkPromoteClass,
        }),
      });

      if (!response.ok) throw new Error("Failed to promote students");

      setShowSuccessDialog(true);
      setSelectedStudents([]);
      loadStudents();
    } catch (error) {
      console.error("Error promoting students:", error);
      alert("Failed to promote students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admissions & Transfers
        </h1>
        <p className="text-gray-500 mt-1">
          Manage student admissions, transfers, and bulk promotions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              New Admissions
            </CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transfers Out</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-admission">New Admission</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Student</TabsTrigger>
          <TabsTrigger value="bulk-promote">Bulk Promote</TabsTrigger>
          <TabsTrigger value="archived">Archived Students</TabsTrigger>
        </TabsList>

        {/* New Admission Tab */}
        <TabsContent value="new-admission">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                New Student Admission Form
              </CardTitle>
              <CardDescription>
                Complete all required information to admit a new student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdmissionSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        required
                        value={admissionForm.first_name}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            first_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        value={admissionForm.middle_name}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            middle_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        required
                        value={admissionForm.last_name}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        required
                        value={admissionForm.date_of_birth}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            date_of_birth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={admissionForm.gender}
                        onValueChange={(value) =>
                          setAdmissionForm({ ...admissionForm, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_group">Blood Group</Label>
                      <Select
                        value={admissionForm.blood_group}
                        onValueChange={(value) =>
                          setAdmissionForm({
                            ...admissionForm,
                            blood_group: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={admissionForm.nationality}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            nationality: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mother_tongue">Mother Tongue</Label>
                      <Input
                        id="mother_tongue"
                        value={admissionForm.mother_tongue}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            mother_tongue: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        id="religion"
                        value={admissionForm.religion}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            religion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={admissionForm.email}
                      onChange={(e) =>
                        setAdmissionForm({
                          ...admissionForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Admission Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Admission Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admission_number">
                        Admission Number *
                      </Label>
                      <Input
                        id="admission_number"
                        required
                        value={admissionForm.admission_number}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            admission_number: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admission_date">Admission Date *</Label>
                      <Input
                        id="admission_date"
                        type="date"
                        required
                        value={admissionForm.admission_date}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            admission_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class_id">Class *</Label>
                      <Select
                        value={admissionForm.class_id}
                        onValueChange={(value) =>
                          setAdmissionForm({
                            ...admissionForm,
                            class_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .filter((cls) => cls.id && cls.id.trim() !== "")
                            .map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section_id">Section *</Label>
                      <Select
                        value={admissionForm.section_id}
                        onValueChange={(value) =>
                          setAdmissionForm({
                            ...admissionForm,
                            section_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections
                            .filter(
                              (section) =>
                                section.id && section.id.trim() !== "",
                            )
                            .map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input
                        id="roll_number"
                        value={admissionForm.roll_number}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            roll_number: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Parent / Guardian Information
                  </h3>

                  {/* Father Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Father's Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="father_name">Father's Name *</Label>
                        <Input
                          id="father_name"
                          required
                          value={admissionForm.father_name}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              father_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="father_phone">Father's Phone *</Label>
                        <Input
                          id="father_phone"
                          required
                          value={admissionForm.father_phone}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              father_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="father_email">Father's Email</Label>
                        <Input
                          id="father_email"
                          type="email"
                          value={admissionForm.father_email}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              father_email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="father_occupation">
                          Father's Occupation
                        </Label>
                        <Input
                          id="father_occupation"
                          value={admissionForm.father_occupation}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              father_occupation: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mother Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Mother's Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mother_name">Mother's Name *</Label>
                        <Input
                          id="mother_name"
                          required
                          value={admissionForm.mother_name}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              mother_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mother_phone">Mother's Phone *</Label>
                        <Input
                          id="mother_phone"
                          required
                          value={admissionForm.mother_phone}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              mother_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mother_email">Mother's Email</Label>
                        <Input
                          id="mother_email"
                          type="email"
                          value={admissionForm.mother_email}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              mother_email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mother_occupation">
                          Mother's Occupation
                        </Label>
                        <Input
                          id="mother_occupation"
                          value={admissionForm.mother_occupation}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              mother_occupation: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guardian Info (Optional) */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Guardian's Details (if different from parents)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guardian_name">Guardian's Name</Label>
                        <Input
                          id="guardian_name"
                          value={admissionForm.guardian_name}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              guardian_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardian_relation">Relation</Label>
                        <Input
                          id="guardian_relation"
                          value={admissionForm.guardian_relation}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              guardian_relation: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardian_phone">Guardian's Phone</Label>
                        <Input
                          id="guardian_phone"
                          value={admissionForm.guardian_phone}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              guardian_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">
                        Contact Name *
                      </Label>
                      <Input
                        id="emergency_contact_name"
                        required
                        value={admissionForm.emergency_contact_name}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            emergency_contact_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">
                        Contact Phone *
                      </Label>
                      <Input
                        id="emergency_contact_phone"
                        required
                        value={admissionForm.emergency_contact_phone}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            emergency_contact_phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_relation">
                        Relation *
                      </Label>
                      <Input
                        id="emergency_contact_relation"
                        required
                        value={admissionForm.emergency_contact_relation}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            emergency_contact_relation: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Address
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_address_line1">
                        Address Line 1 *
                      </Label>
                      <Input
                        id="current_address_line1"
                        required
                        value={admissionForm.current_address_line1}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            current_address_line1: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_address_line2">
                        Address Line 2
                      </Label>
                      <Input
                        id="current_address_line2"
                        value={admissionForm.current_address_line2}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            current_address_line2: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_city">City *</Label>
                      <Input
                        id="current_city"
                        required
                        value={admissionForm.current_city}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            current_city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_state">State *</Label>
                      <Input
                        id="current_state"
                        required
                        value={admissionForm.current_state}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            current_state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_postal_code">Postal Code *</Label>
                      <Input
                        id="current_postal_code"
                        required
                        value={admissionForm.current_postal_code}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            current_postal_code: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_country">Country *</Label>
                      <Input
                        id="current_country"
                        required
                        value={admissionForm.current_country}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            current_country: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Transport & Hostel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transport & Hostel
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transport_required"
                      checked={admissionForm.transport_required}
                      onCheckedChange={(checked) =>
                        setAdmissionForm({
                          ...admissionForm,
                          transport_required: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="transport_required">
                      Transport Required
                    </Label>
                  </div>

                  {admissionForm.transport_required && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bus_route">Bus Route</Label>
                        <Input
                          id="bus_route"
                          value={admissionForm.bus_route}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              bus_route: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_point">Pickup Point</Label>
                        <Input
                          id="pickup_point"
                          value={admissionForm.pickup_point}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              pickup_point: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hostel_resident"
                      checked={admissionForm.hostel_resident}
                      onCheckedChange={(checked) =>
                        setAdmissionForm({
                          ...admissionForm,
                          hostel_resident: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="hostel_resident">Hostel Resident</Label>
                  </div>

                  {admissionForm.hostel_resident && (
                    <div className="space-y-2">
                      <Label htmlFor="hostel_room_number">Room Number</Label>
                      <Input
                        id="hostel_room_number"
                        value={admissionForm.hostel_room_number}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            hostel_room_number: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Medical Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">
                      Allergies (comma-separated)
                    </Label>
                    <Input
                      id="allergies"
                      placeholder="e.g., Peanuts, Dust, Penicillin"
                      value={admissionForm.allergies}
                      onChange={(e) =>
                        setAdmissionForm({
                          ...admissionForm,
                          allergies: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chronic_conditions">
                      Chronic Conditions (comma-separated)
                    </Label>
                    <Input
                      id="chronic_conditions"
                      placeholder="e.g., Asthma, Diabetes"
                      value={admissionForm.chronic_conditions}
                      onChange={(e) =>
                        setAdmissionForm({
                          ...admissionForm,
                          chronic_conditions: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_notes">Medical Notes</Label>
                    <Textarea
                      id="medical_notes"
                      placeholder="Any other medical information..."
                      value={admissionForm.medical_notes}
                      onChange={(e) =>
                        setAdmissionForm({
                          ...admissionForm,
                          medical_notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Previous School (if transfer) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Previous School Details
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_transfer"
                      checked={admissionForm.is_transfer}
                      onCheckedChange={(checked) =>
                        setAdmissionForm({
                          ...admissionForm,
                          is_transfer: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="is_transfer">
                      Transfer from another school
                    </Label>
                  </div>

                  {admissionForm.is_transfer && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="previous_school_name">
                          Previous School Name
                        </Label>
                        <Input
                          id="previous_school_name"
                          value={admissionForm.previous_school_name}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              previous_school_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previous_class">Previous Class</Label>
                        <Input
                          id="previous_class"
                          value={admissionForm.previous_class}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              previous_class: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer_certificate_number">
                          TC Number
                        </Label>
                        <Input
                          id="transfer_certificate_number"
                          value={admissionForm.transfer_certificate_number}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              transfer_certificate_number: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Special Needs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Special Needs
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_special_needs"
                      checked={admissionForm.has_special_needs}
                      onCheckedChange={(checked) =>
                        setAdmissionForm({
                          ...admissionForm,
                          has_special_needs: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="has_special_needs">Has special needs</Label>
                  </div>

                  {admissionForm.has_special_needs && (
                    <div className="space-y-2">
                      <Label htmlFor="special_needs_description">
                        Description
                      </Label>
                      <Textarea
                        id="special_needs_description"
                        placeholder="Describe the special needs..."
                        value={admissionForm.special_needs_description}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            special_needs_description: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submit Admission
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Student Tab */}
        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Transfer Student
              </CardTitle>
              <CardDescription>
                Transfer student within school or process external transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Select Student *</Label>
                    <Select
                      value={transferForm.student_id}
                      onValueChange={(value) =>
                        setTransferForm({ ...transferForm, student_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students
                          .filter(
                            (student) => student.id && student.id.trim() !== "",
                          )
                          .map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.first_name} {student.last_name} (
                              {student.admission_number})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer_type">Transfer Type *</Label>
                    <Select
                      value={transferForm.transfer_type}
                      onValueChange={(value) =>
                        setTransferForm({
                          ...transferForm,
                          transfer_type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="within_school">
                          Within School
                        </SelectItem>
                        <SelectItem value="external">
                          External (Leaving School)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {transferForm.transfer_type === "within_school" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="to_class_id">To Class *</Label>
                          <Select
                            value={transferForm.to_class_id}
                            onValueChange={(value) =>
                              setTransferForm({
                                ...transferForm,
                                to_class_id: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes
                                .filter((cls) => cls.id && cls.id.trim() !== "")
                                .map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to_section_id">To Section *</Label>
                          <Select
                            value={transferForm.to_section_id}
                            onValueChange={(value) =>
                              setTransferForm({
                                ...transferForm,
                                to_section_id: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {sections
                                .filter(
                                  (section) =>
                                    section.id && section.id.trim() !== "",
                                )
                                .map((section) => (
                                  <SelectItem
                                    key={section.id}
                                    value={section.id}
                                  >
                                    {section.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tc_issued"
                          checked={transferForm.tc_issued}
                          onCheckedChange={(checked) =>
                            setTransferForm({
                              ...transferForm,
                              tc_issued: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="tc_issued">
                          Transfer Certificate Issued
                        </Label>
                      </div>

                      {transferForm.tc_issued && (
                        <div className="space-y-2">
                          <Label htmlFor="tc_number">TC Number</Label>
                          <Input
                            id="tc_number"
                            value={transferForm.tc_number}
                            onChange={(e) =>
                              setTransferForm({
                                ...transferForm,
                                tc_number: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="effective_date">Effective Date *</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      required
                      value={transferForm.effective_date}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          effective_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Reason for transfer..."
                      value={transferForm.reason}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          reason: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setTransferForm({
                        student_id: "",
                        transfer_type: "within_school",
                        from_class_id: "",
                        from_section_id: "",
                        to_class_id: "",
                        to_section_id: "",
                        effective_date: new Date().toISOString().split("T")[0],
                        reason: "",
                        tc_issued: false,
                        tc_number: "",
                      })
                    }
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Process Transfer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Promote Tab */}
        <TabsContent value="bulk-promote">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Promote Students
              </CardTitle>
              <CardDescription>
                Select multiple students and promote them to the next class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="bulk_promote_class">Promote to Class *</Label>
                  <Select
                    value={bulkPromoteClass}
                    onValueChange={setBulkPromoteClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes
                        .filter((cls) => cls.id && cls.id.trim() !== "")
                        .map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleBulkPromote}
                    disabled={
                      loading ||
                      selectedStudents.length === 0 ||
                      !bulkPromoteClass
                    }
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Promoting...
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Promote Selected ({selectedStudents.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedStudents.length === students.length &&
                            students.length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudents(students.map((s) => s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Class</TableHead>
                      <TableHead>Section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStudents([
                                    ...selectedStudents,
                                    student.id,
                                  ]);
                                } else {
                                  setSelectedStudents(
                                    selectedStudents.filter(
                                      (id) => id !== student.id,
                                    ),
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{student.admission_number}</TableCell>
                          <TableCell>
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>{student.class_name || "N/A"}</TableCell>
                          <TableCell>{student.section_name || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archived Students Tab */}
        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Students
              </CardTitle>
              <CardDescription>
                View and manage students who have left the school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Archived students list will appear here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Students with status: transferred_out, graduated, withdrawn
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Success!
            </DialogTitle>
            <DialogDescription>
              The operation has been completed successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
