import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { SchoolSettingsForm } from "@/components/school-admin/settings/school-settings-form";
import { PreferencesForm } from "@/components/school-admin/settings/preferences-form";
import { NotificationSettings } from "@/components/school-admin/settings/notification-settings";
import { AcademicSettings } from "@/components/school-admin/settings/academic-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Settings as SettingsIcon,
  Bell,
  Calendar,
} from "lucide-react";

export default async function SettingsPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch school data
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  // Fetch current user profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          School Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage your school's configuration and preferences
        </p>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="school" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            School
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6">
          <SchoolSettingsForm school={school} />
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <AcademicSettings school={school} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesForm school={school} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings school={school} userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
