import { AdminDataTable } from "@/components/ui/admin-data-table";
import { columns } from "./columns";
import { SuperAdminService } from "@/services/super-admin";

export default async function SuperAdminAudit() {
  const service = new SuperAdminService();
  const logs = await service.getRecentAuditLogs(500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            System Audit
          </h2>
          <p className="text-muted-foreground">
            Track all critical actions performed within the platform.
          </p>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={logs}
        searchKey="table_name"
        searchPlaceholder="Filter by resource..."
      />
    </div>
  );
}
