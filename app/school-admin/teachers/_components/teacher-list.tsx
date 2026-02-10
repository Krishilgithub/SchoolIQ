"use client";

import { Teacher } from "@/lib/types/teacher";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { columns } from "./columns";

interface TeacherListProps {
  data: Teacher[];
}

export function TeacherList({ data }: TeacherListProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={data}
      searchKey="full_name"
      searchPlaceholder="Search teachers..."
    />
  );
}
