"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Database } from "@/types/database.types";
import { createExamAction } from "@/lib/actions/exam-actions";

type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
type ExamType = Database["public"]["Tables"]["exam_types"]["Row"];
type GradingScheme = Database["public"]["Tables"]["grading_schemes_new"]["Row"];
type Term = Database["public"]["Tables"]["terms"]["Row"];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  academic_year_id: z.string().min(1, "Please select an academic year."),
  term_id: z.string().optional(),
  exam_type_id: z.string().min(1, "Please select an exam type."),
  grading_scheme_id: z.string().min(1, "Please select a grading scheme."),
  start_date: z.date({
    required_error: "Start date is required.",
  }),
  end_date: z.date({
    required_error: "End date is required.",
  }),
  result_declaration_date: z.date().optional(),
});

interface CreateExamFormProps {
  schoolId: string;
  academicYears: AcademicYear[];
  examTypes: ExamType[];
  gradingSchemes: GradingScheme[];
  terms: Term[];
}

export function CreateExamForm({
  schoolId,
  academicYears,
  examTypes,
  gradingSchemes,
  terms,
}: CreateExamFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      academic_year_id: "",
      term_id: "",
      exam_type_id: "",
      grading_scheme_id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createExamAction({
        school_id: schoolId,
        name: values.name,
        description: values.description || null,
        academic_year_id: values.academic_year_id,
        term_id: values.term_id || null,
        exam_type_id: values.exam_type_id,
        grading_scheme_id: values.grading_scheme_id,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        result_declaration_date: values.result_declaration_date
          ? values.result_declaration_date.toISOString()
          : null,
      });

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      router.push(`/school-admin/academics/exams`);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Exam Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Mid-Term Exam 2024" {...field} />
              </FormControl>
              <FormDescription>
                A clear, descriptive name for this examination
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Provide additional details about this exam..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional additional information about the exam
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Academic Year and Term */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="academic_year_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {academicYears
                      .filter((year) => year.id && year.id.trim() !== "")
                      .map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {terms
                      .filter((term) => term.id && term.id.trim() !== "")
                      .map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Link this exam to a specific term
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Exam Type and Grading Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="exam_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {examTypes
                      .filter((type) => type.id && type.id.trim() !== "")
                      .map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Category of examination (e.g., Formative, Summative)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grading_scheme_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grading Scheme *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grading scheme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gradingSchemes
                      .filter((scheme) => scheme.id && scheme.id.trim() !== "")
                      .map((scheme) => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>How this exam will be graded</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>When the exam begins</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        form.watch("start_date")
                          ? date < form.watch("start_date")
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>When the exam ends</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="result_declaration_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Result Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        form.watch("end_date")
                          ? date < form.watch("end_date")
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Results announcement date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Exam"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
