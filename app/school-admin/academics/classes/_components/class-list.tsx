"use client";

import { useState, useEffect } from "react";
// import { ClassService } from "@/lib/services/class";
import { Class } from "@/lib/types/academic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ClassListProps {
  schoolId: string;
}

import {
  getClassesAction,
  deleteClassAction,
} from "@/lib/actions/class-actions";

export function ClassList({ schoolId }: ClassListProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      // Ensure we use the correct filter properties expected by the action
      if (search) filters.search = search;
      if (gradeFilter && gradeFilter !== "all")
        filters.gradeLevel = parseInt(gradeFilter);

      const data = await getClassesAction(schoolId, filters);

      const classesWithDates = data.map((c) => ({
        ...c,
        created_at: new Date(c.created_at),
        updated_at: new Date(c.updated_at),
      }));

      setClasses(classesWithDates);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch classes",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, gradeFilter, schoolId]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this class? This action cannot be undone.",
      )
    )
      return;

    try {
      const { success, error } = await deleteClassAction(id);
      if (!success) throw new Error(error);

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Grade Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                Grade {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/school-admin/academics/classes/${cls.id}`}
                      className="hover:underline text-primary"
                    >
                      {cls.name}
                    </Link>
                  </TableCell>
                  <TableCell>{cls.grade_level}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cls.section}</Badge>
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore - joined data */}
                    {cls.class_teacher?.full_name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {cls.total_students}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/school-admin/academics/classes/${cls.id}`}
                          >
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {}}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(cls.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
