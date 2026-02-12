"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem,SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimetableFormData } from "@/app/school-admin/academics/timetable/create/page";
import { Calendar } from "lucide-react";

interface BasicInfoStepProps {
  formData: TimetableFormData;
  setFormData: (data: TimetableFormData) => void;
}

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export function BasicInfoStep({ formData, setFormData }: BasicInfoStepProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/school-admin/academic-years");
      if (response.ok) {
        const data = await response.json();
        setAcademicYears(data);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TimetableFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Enter the basic details for this timetable
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Timetable Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Timetable Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Spring Semester 2024"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for this timetable
            </p>
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <Label htmlFor="academic_year">
              Academic Year <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.academic_year_id}
              onValueChange={(value) => handleChange("academic_year_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : academicYears.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No academic years found
                  </SelectItem>
                ) : (
                  academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the academic year for this timetable
            </p>
          </div>

          {/* Effective From */}
          <div className="space-y-2">
            <Label htmlFor="effective_from">
              Effective From <span className="text-red-500">*</span>
            </Label>
            <Input
              id="effective_from"
              type="date"
              value={formData.effective_from}
              onChange={(e) => handleChange("effective_from", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              When this timetable becomes active
            </p>
          </div>

          {/* Effective Until */}
          <div className="space-y-2">
            <Label htmlFor="effective_until">
              Effective Until
            </Label>
            <Input
              id="effective_until"
              type="date"
              value={formData.effective_until}
              onChange={(e) => handleChange("effective_until", e.target.value)}
              min={formData.effective_from}
            />
            <p className="text-xs text-muted-foreground">
              End date (optional, leave blank for indefinite)
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Add any additional notes or details about this timetable..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Optional description for this timetable
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
