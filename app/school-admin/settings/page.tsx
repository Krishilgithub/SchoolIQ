import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your school profile and preferences.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>School Profile</CardTitle>
            <CardDescription>
              Update your school's public information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input id="schoolName" defaultValue={school?.name} disabled />
              <p className="text-[0.8rem] text-muted-foreground">
                Please contact support to change your school name.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                defaultValue={school?.address || ""}
                placeholder="123 Education Lane"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                defaultValue={school?.contact_email || ""}
                placeholder="admin@school.com"
              />
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Settings</CardTitle>
            <CardDescription>
              Configure academic years and grading systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4 text-muted-foreground text-sm border-dashed border-2 rounded-md">
              Academic settings configuration coming soon.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive alerts and updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4 text-muted-foreground text-sm border-dashed border-2 rounded-md">
              Notification settings coming soon.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
