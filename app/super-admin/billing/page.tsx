import { AdminDataTable } from "@/components/ui/admin-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Wallet, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/super-admin/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { SuperAdminService } from "@/services/super-admin";

type Invoice = {
  id: string;
  school: string;
  amount: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  date: string;
  plan: string;
};

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: "Invoice ID",
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono text-xs">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "school",
    header: "School",
    cell: ({ row }) => (
      <div className="text-foreground font-medium">
        {row.getValue("school")}
      </div>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="outline" className="border-border text-muted-foreground">
        {row.getValue("plan")}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-foreground font-medium">
        {row.getValue("amount")}
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
            status === "PAID"
              ? "border-emerald-500/20 text-emerald-500"
              : status === "PENDING"
                ? "border-yellow-500/20 text-yellow-500"
                : "border-destructive/20 text-destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-xs">
        {row.getValue("date")}
      </div>
    ),
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    school: "Springfield Elementary",
    amount: "$2,400.00",
    status: "PAID",
    date: "Oct 24, 2024",
    plan: "Enterprise",
  },
  {
    id: "INV-002",
    school: "Apex Academy",
    amount: "$850.00",
    status: "PENDING",
    date: "Oct 26, 2024",
    plan: "Standard",
  },
  {
    id: "INV-003",
    school: "Global International",
    amount: "$4,200.00",
    status: "PAID",
    date: "Oct 22, 2024",
    plan: "Enterprise Plus",
  },
  {
    id: "INV-004",
    school: "Little Stars",
    amount: "$150.00",
    status: "OVERDUE",
    date: "Sep 15, 2024",
    plan: "Basic",
  },
];

export default async function BillingPage() {
  const service = new SuperAdminService();
  const stats = await service.getBillingStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Billing & Revenue
          </h2>
          <p className="text-muted-foreground">
            Manage subscriptions, invoices, and payment gateways.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <CreditCard className="mr-2 h-4 w-4" /> Configure Gateways
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-emerald-500"
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices.toString()}
          icon={Wallet}
          iconColor="text-yellow-500"
          description={`${stats.pendingInvoices} invoices`}
        />
        <StatCard
          title="MRR"
          value={`$${stats.mrr.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-blue-500"
          trend="+4%"
          trendUp={true}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions.toString()}
          icon={CreditCard}
          iconColor="text-violet-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Invoices
        </h3>
        <AdminDataTable
          columns={invoiceColumns}
          data={mockInvoices}
          searchKey="school"
          searchPlaceholder="Search invoices..."
        />
      </div>
    </div>
  );
}
