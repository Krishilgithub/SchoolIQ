import { superAdminService } from "@/lib/services/super-admin";
import { SchoolDetailsHeader } from "@/components/super-admin/schools/school-details-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  CreditCard,
  Activity,
  Settings,
  TrendingUp,
} from "lucide-react";
import { UsersTable } from "@/components/super-admin/users/users-table";
import { SchoolSettingsForm } from "@/components/super-admin/schools/school-settings-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SchoolDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  // Fetch school details
  const schools = await superAdminService.getAllSchools();
  // @ts-ignore
  const school = schools?.find((s) => s.id === params.id);

  if (!school) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          School not found
        </h2>
        <p className="text-slate-500">The requested school does not exist.</p>
      </div>
    );
  }

  // Fetch users for this school
  const users = await superAdminService.getUsersBySchoolId(params.id);

  return (
    <div className="space-y-8 pt-2 pb-12 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <SchoolDetailsHeader school={school} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Status
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Good</div>
                <p className="text-xs text-muted-foreground">System Health</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {school.subscription_status === "active"
                    ? "Standard"
                    : "Free"}
                </div>
                <p className="text-xs text-muted-foreground font-medium capitalize text-emerald-600">
                  {school.subscription_status}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Low</div>
                <p className="text-xs text-muted-foreground">
                  Resource Utilization
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions performed within this school account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 py-8 text-center italic">
                No recent activity found.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage admins, teachers, and staff for {school.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable data={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>View plan details and status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">
                    Current Plan
                  </span>
                  <p className="text-lg font-medium">Standard Plan</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">
                    Status
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${school.subscription_status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <p className="text-lg font-medium capitalize">
                      {school.subscription_status}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">
                    Billing Interval
                  </span>
                  <p className="text-lg font-medium">Monthly</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">
                    Next Invoice
                  </span>
                  <p className="text-lg font-medium">March 1, 2026</p>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <p className="text-sm text-slate-500 text-center">
                  Billing management is handled via Stripe. Please contact
                  support to change plans.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <SchoolSettingsForm school={school} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
