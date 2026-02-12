"use client";

import { useState, useEffect } from "react";
// import { SubjectService } from "@/lib/services/subject";
import { Subject } from "@/lib/types/academic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Pencil, Trash2, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { EditSubjectModal } from "./edit-subject-modal";

interface SubjectListProps {
  schoolId: string;
}

import {
  getSubjectsAction,
  deleteSubjectAction,
} from "@/lib/actions/subject-actions";

export function SubjectList({ schoolId }: SubjectListProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      // Use Server Action instead of direct service
      const data = await getSubjectsAction(schoolId, search);
      // Data is already filtered by server action if search passed,
      // but if we want client-side filtering we can keep filter logic or rely on server.
      // The server action accepts search.

      // Convert string dates back to Date objects if needed or keep strings
      // The interface Subject expects Date objects for created_at/updated_at
      const subjectsWithDates = data.map((s) => ({
        ...s,
        created_at: new Date(s.created_at),
        updated_at: new Date(s.updated_at),
      }));

      setSubjects(subjectsWithDates);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch subjects",
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
      fetchSubjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, schoolId]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subject? This might affect existing classes and exams.",
      )
    )
      return;

    try {
      const { success, error } = await deleteSubjectAction(id);
      if (!success) throw new Error(error);

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deparment</TableHead>
              <TableHead>Description</TableHead>
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
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No subjects found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono">
                      {subject.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    {/* Assuming there might be a type in future, currently just standard */}
                    Standard
                  </TableCell>
                  <TableCell>
                    {/* Placeholder for department if added later */}-
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {subject.description || "-"}
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
                        <DropdownMenuItem
                          onClick={() => setEditingSubject(subject)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(subject.id)}
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

      {editingSubject && (
        <EditSubjectModal
          subject={editingSubject}
          open={!!editingSubject}
          onOpenChange={(open) => !open && setEditingSubject(null)}
          onSuccess={fetchSubjects}
        />
      )}
    </div>
  );
}
