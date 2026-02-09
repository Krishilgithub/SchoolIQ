import { superAdminService } from "@/lib/services/super-admin";
import { PageHeader } from "@/components/super-admin/common/page-header";
import { UsersTable } from "@/components/super-admin/users/users-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default async function UsersPage() {
  const users = await superAdminService.getAllUsers();

  return (
    <div className="space-y-8 pt-2 pb-12 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <PageHeader
        title="User Management"
        description="View and manage all users across the platform."
      >
        <Button
          variant="outline"
          className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </PageHeader>

      <UsersTable data={users} />
    </div>
  );
}
