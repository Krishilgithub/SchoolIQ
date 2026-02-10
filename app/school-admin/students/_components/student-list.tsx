"use client";

import { Student } from "@/lib/types/student";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { columns } from "./columns";

interface StudentListProps {
  data: Student[];
}

export function StudentList({ data }: StudentListProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={data}
      searchKey="first_name"
      searchPlaceholder="Search students..."
    />
  );
}
