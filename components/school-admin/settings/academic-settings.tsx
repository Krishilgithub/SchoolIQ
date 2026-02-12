"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

const academicFormSchema = z.object({
  academicYearStart: z.string().min(1, "Academic year start is required"),
  academicYearEnd: z.string().min(1, "Academic year end is required"),
  currentTerm: z.string().optional(),
  gradingSystem: z.enum(["percentage", "gpa", "letter"]),
  attendanceThreshold: z.string().min(0).max(100),
});

type AcademicFormValues = z.infer<typeof academicFormSchema>;

interface AcademicSettingsProps {
  school: any;
}

export function AcademicSettings({ school }: AcademicSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Parse settings from school.settings JSON if available
  const settings = school?.settings || {};

  const form = useForm<AcademicFormValues>({
    resolver: zodResolver(academicFormSchema),
    defaultValues: {
      academicYearStart: settings.academicYearStart || "2024-04-01",
      academicYearEnd: settings.academicYearEnd || "2025-03-31",
      currentTerm: settings.currentTerm || "1",
      gradingSystem: settings.gradingSystem || "percentage",
      attendanceThreshold: settings.attendanceThreshold || "75",
    },
  });

  async function onSubmit(data: AcademicFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/school-admin/settings/academic", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            ...settings,
            academicYearStart: data.academicYearStart,
            academicYearEnd: data.academicYearEnd,
            currentTerm: data.currentTerm,
            gradingSystem: data.gradingSystem,
            attendanceThreshold: data.attendanceThreshold,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update academic settings");
      }

      toast.success("Academic settings updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update academic settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Academic Configuration
        </CardTitle>
        <CardDescription>
          Configure academic year, terms, and grading system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="academicYearStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Start date of the academic year
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicYearEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      End date of the academic year
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Term/Semester</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Term 1</SelectItem>
                        <SelectItem value="2">Term 2</SelectItem>
                        <SelectItem value="3">Term 3</SelectItem>
                        <SelectItem value="summer">Summer Term</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The current active term</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradingSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grading System</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grading system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (0-100%)
                        </SelectItem>
                        <SelectItem value="gpa">GPA (0.0-4.0)</SelectItem>
                        <SelectItem value="letter">
                          Letter Grade (A-F)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How grades are calculated and displayed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendanceThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Attendance Required (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="75"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum attendance percentage required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
