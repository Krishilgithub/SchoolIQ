"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Save,
  Upload,
} from "lucide-react";
import { TimetableFormData } from "@/app/school-admin/academics/timetable/create/page";

interface ReviewStepProps {
  formData: TimetableFormData;
  onSubmit: (status: "draft" | "published") => void;
  loading: boolean;
}

export function ReviewStep({ formData, onSubmit, loading }: ReviewStepProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupEntriesByDay = () => {
    const grouped: Record<number, typeof formData.entries> = {};
    formData.entries.forEach((entry) => {
      if (!grouped[entry.day_of_week]) {
        grouped[entry.day_of_week] = [];
      }
      grouped[entry.day_of_week].push(entry);
    });
    return grouped;
  };

  const getDayName = (day: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day] || "";
  };

  const groupedEntries = groupEntriesByDay();
  const totalEntries = formData.entries.length;
  const daysWithClasses = Object.keys(groupedEntries).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <CheckCircle className="h-5 w-5" />
            Review Your Timetable
          </CardTitle>
          <CardDescription className="text-orange-700">
            Please review all information before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <FileText className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{totalEntries}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold">{daysWithClasses}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1">Ready</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Timetable Name</p>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Academic Year</p>
              <p className="font-medium">{formData.academic_year_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effective From</p>
              <p className="font-medium">
                {formatDate(formData.effective_from)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effective Until</p>
              <p className="font-medium">
                {formData.effective_until
                  ? formatDate(formData.effective_until)
                  : "Indefinite"}
              </p>
            </div>
          </div>
          {formData.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{formData.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
          <CardDescription>Entries grouped by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          {totalEntries === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No entries added</p>
              <p className="text-sm">Go back to add timetable entries</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEntries)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([day, entries]) => (
                  <div key={day} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-600">
                        {getDayName(parseInt(day))}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entries.length}{" "}
                        {entries.length === 1 ? "period" : "periods"}
                      </span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {entries.map((entry, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg bg-slate-50 space-y-1"
                        >
                          <p className="text-sm font-medium">
                            Period {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Class: {entry.class_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Subject: {entry.subject_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Teacher: {entry.teacher_id}
                          </p>
                          {entry.room_id && (
                            <p className="text-xs text-muted-foreground">
                              Room: {entry.room_id}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you want to save this timetable:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => onSubmit("draft")}
                disabled={loading || totalEntries === 0}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                Save as Draft
              </Button>
              <Button
                onClick={() => onSubmit("published")}
                disabled={loading || totalEntries === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Publish Timetable
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {totalEntries === 0
                ? "Add at least one entry to continue"
                : "Published timetables will be visible to students and teachers"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
