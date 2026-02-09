import { ActiveSchoolsWidget } from "@/components/admin/dashboard/active-schools";
import { superAdminService, DashboardSchool } from "@/lib/services/super-admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SchoolsPage() {
  const schoolsData = await superAdminService.getAllSchools();

  // Map real data to widget type
  // We use 'any' for s here because the inferred type from Supabase might be strict and we are doing a loose mapping
  const schools: DashboardSchool[] = schoolsData.map((s: any) => ({
    id: s.id,
    name: s.name,
    plan: "Free", // Default since we don't have plan column yet
    status:
      s.status === "active"
        ? "Active"
        : s.status === "suspended"
          ? "Suspended"
          : "Pending",
    users: s.school_members ? s.school_members[0].count : 0,
    revenue: 0,
    health: 100,
    lastActive: new Date(s.updated_at || s.created_at).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Schools
          </h2>
          <p className="text-muted-foreground">
            Manage all registered schools on the platform.
          </p>
        </div>
        <Link href="/auth/register" passHref>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add School
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {schools.length > 0 ? (
          <ActiveSchoolsWidget schools={schools} />
        ) : (
          <div className="p-8 text-center border rounded-lg bg-white">
            <p className="text-muted-foreground">No schools found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
