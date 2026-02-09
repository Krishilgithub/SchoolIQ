import { AdminDataTable } from "@/components/ui/admin-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, KeyRound, Globe, Server } from "lucide-react";
import { StatCard } from "@/components/super-admin/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { SuperAdminService } from "@/services/super-admin";

type LoginEvent = {
  id: string;
  user: string;
  ip: string;
  location: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  timestamp: string;
};

const loginColumns: ColumnDef<LoginEvent>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="text-foreground font-medium">{row.getValue("user")}</div>
    ),
  },
  {
    accessorKey: "ip",
    header: "IP Address",
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono text-xs">
        {row.getValue("ip")}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-xs">
        {row.getValue("location")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant="outline"
          className={
            status === "SUCCESS"
              ? "border-emerald-500/20 text-emerald-500"
              : status === "FAILED"
                ? "border-orange-500/20 text-orange-500"
                : "border-destructive/20 bg-destructive/10 text-destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: "Time",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-xs">
        {row.getValue("timestamp")}
      </div>
    ),
  },
];

const mockLogins: LoginEvent[] = [
  {
    id: "1",
    user: "krishil@schooliq.com",
    ip: "192.168.1.1",
    location: "Mumbai, IN",
    status: "SUCCESS",
    timestamp: "Just now",
  },
  {
    id: "2",
    user: "admin@apex.edu",
    ip: "10.0.0.5",
    location: "Delhi, IN",
    status: "SUCCESS",
    timestamp: "2 mins ago",
  },
  {
    id: "3",
    user: "unknown@bot.com",
    ip: "45.2.1.2",
    location: "Moscow, RU",
    status: "BLOCKED",
    timestamp: "5 mins ago",
  },
  {
    id: "4",
    user: "teacher@dav.edu",
    ip: "172.16.0.1",
    location: "Pune, IN",
    status: "FAILED",
    timestamp: "10 mins ago",
  },
];

export default async function SecurityCenter() {
  const service = new SuperAdminService();
  const systemHealth = await service.getSystemHealth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Security Center
          </h2>
          <p className="text-muted-foreground">
            Monitor threats, manage access, and configure security policies.
          </p>
        </div>
        <Button
          variant="destructive"
          className="bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive"
        >
          <Lock className="mr-2 h-4 w-4" /> Lockdown Platform
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Security Score"
          value="98/100"
          icon={ShieldCheck}
          iconColor="text-emerald-500"
          trend="Secure"
          trendUp={true}
        />
        <StatCard
          title="System Status"
          value={systemHealth.database.toUpperCase()}
          icon={Server}
          iconColor={
            systemHealth.database === "healthy"
              ? "text-emerald-500"
              : "text-destructive"
          }
          description={`API Latency: ${systemHealth.apiLatency}ms`}
        />
        <StatCard
          title="Active Sessions"
          value="1,203"
          icon={Globe}
          iconColor="text-blue-500"
        />
        <StatCard
          title="MFA Enforced"
          value="100%"
          icon={KeyRound}
          iconColor="text-violet-500"
          description="Super Admins"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Login Activity
        </h3>
        <AdminDataTable
          columns={loginColumns}
          data={mockLogins}
          searchKey="user"
          searchPlaceholder="Search logs..."
        />
      </div>
    </div>
  );
}
