"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, School, BookOpen, User, MapPin } from "lucide-react";
import { TimetableFormData, TimetableEntryData } from "@/app/school-admin/academics/timetable/create/page";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimetableEntriesStepProps {
  formData: TimetableFormData;
  setFormData: (data: TimetableFormData) => void;
}

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  period_number: number;
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Room {
  id: string;
  name: string;
  room_number: string;
}

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function TimetableEntriesStep({ formData, setFormData }: TimetableEntriesStepProps) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // New entry form state
  const [newEntry, setNewEntry] = useState<TimetableEntryData>({
    day_of_week: 1,
    period_id: "",
    class_id: "",
    section_id: "",
    subject_id: "",
    teacher_id: "",
    room_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [periodsRes, classesRes, subjectsRes, teachersRes, roomsRes] = await Promise.all([
        fetch("/api/school-admin/periods"),
        fetch("/api/school-admin/classes"),
        fetch("/api/school-admin/subjects"),
        fetch("/api/school-admin/teachers"),
        fetch("/api/school-admin/rooms"),
      ]);

      if (periodsRes.ok) {
        const data = await periodsRes.json();
        setPeriods(data);
      }
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
      }
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data);
      }
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data);
      }
      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load required data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newEntry.class_id) {
      fetchSections(newEntry.class_id);
    }
  }, [newEntry.class_id]);

  const fetchSections = async (classId: string) => {
    try {
      const response = await fetch(`/api/school-admin/classes/${classId}/sections`);
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const handleAddEntry = () => {
    // Validation
    if (!newEntry.day_of_week || !newEntry.period_id || !newEntry.class_id || 
        !newEntry.subject_id || !newEntry.teacher_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for conflicts
    const conflict = formData.entries.find(
      (entry) =>
        entry.day_of_week === newEntry.day_of_week &&
        entry.period_id === newEntry.period_id &&
        (entry.class_id === newEntry.class_id || entry.teacher_id === newEntry.teacher_id)
    );

    if (conflict) {
      toast.error("Conflict detected: This slot is already occupied");
      return;
    }

    setFormData({
      ...formData,
      entries: [...formData.entries, newEntry],
    });

    // Reset form
    setNewEntry({
      day_of_week: 1,
      period_id: "",
      class_id: "",
      section_id: "",
      subject_id: "",
      teacher_id: "",
      room_id: "",
      notes: "",
    });

    toast.success("Entry added successfully");
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = formData.entries.filter((_, i) => i !== index);
    setFormData({ ...formData, entries: updatedEntries });
    toast.success("Entry removed");
  };

  const getDayName = (day: number) => {
    return DAYS.find((d) => d.value === day)?.label || "";
  };

  const getPeriodName = (periodId: string) => {
    return periods.find((p) => p.id === periodId)?.name || "";
  };

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id === classId)?.name || "";
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "";
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "";
  };

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || "N/A";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-600" />
            Add Timetable Entry
          </CardTitle>
          <CardDescription>
            Add individual class periods to the timetable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Day of Week */}
            <div className="space-y-2">
              <Label>
                Day <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newEntry.day_of_week.toString()}
                onValueChange={(value) =>
                  setNewEntry({ ...newEntry, day_of_week: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {day.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label>
                Period <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newEntry.period_id}
                onValueChange={(value) => setNewEntry({ ...newEntry, period_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {period.name} ({period.start_time} - {period.end_time})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class */}
            <div className="space-y-2">
              <Label>
                Class <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newEntry.class_id}
                onValueChange={(value) => setNewEntry({ ...newEntry, class_id: value, section_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        {cls.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section (optional) */}
            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={newEntry.section_id || ""}
                onValueChange={(value) => setNewEntry({ ...newEntry, section_id: value })}
                disabled={!newEntry.class_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No sections available
                    </SelectItem>
                  ) : (
                    sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newEntry.subject_id}
                onValueChange={(value) => setNewEntry({ ...newEntry, subject_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject.name} ({subject.code})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher */}
            <div className="space-y-2">
              <Label>
                Teacher <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newEntry.teacher_id}
                onValueChange={(value) => setNewEntry({ ...newEntry, teacher_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {teacher.first_name} {teacher.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room */}
            <div className="space-y-2">
              <Label>Room</Label>
              <Select
                value={newEntry.room_id || ""}
                onValueChange={(value) => setNewEntry({ ...newEntry, room_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {room.name} - {room.room_number}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional notes"
                value={newEntry.notes || ""}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleAddEntry}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Added Entries ({formData.entries.length})</CardTitle>
          <CardDescription>
            Review and manage the timetable entries for this schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No entries added yet</p>
              <p className="text-sm">Add entries using the form above</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">
                          {getDayName(entry.day_of_week)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPeriodName(entry.period_id)}</TableCell>
                      <TableCell>{getClassName(entry.class_id)}</TableCell>
                      <TableCell>{getSubjectName(entry.subject_id)}</TableCell>
                      <TableCell>{getTeacherName(entry.teacher_id)}</TableCell>
                      <TableCell>{getRoomName(entry.room_id || "")}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEntry(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
