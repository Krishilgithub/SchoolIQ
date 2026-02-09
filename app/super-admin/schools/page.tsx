import { superAdminService } from "@/lib/services/super-admin";
import { PageHeader } from "@/components/super-admin/common/page-header";
import {
  SchoolsTable,
  SchoolTableItem,
} from "@/components/super-admin/schools/schools-table";
import { AddSchoolDialog } from "@/components/super-admin/schools/add-school-dialog";

export default async function SchoolsPage() {
  const schools = await superAdminService.getAllSchools();

  return (
    <div className="space-y-8 pt-2 pb-12 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <PageHeader
        title="Schools Management"
        description="Manage school tenants, view status, and configure access."
      >
        <AddSchoolDialog />
      </PageHeader>

      <SchoolsTable data={schools as unknown as SchoolTableItem[]} />
    </div>
  );
}
