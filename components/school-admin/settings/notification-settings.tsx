"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotificationSettingsProps {
  school: any;
  userId?: string;
}

export function NotificationSettings({
  school,
  userId,
}: NotificationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Get current notification preferences from school settings
  const settings = school?.settings?.notifications || {};

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: settings.emailNotifications ?? true,
    browserNotifications: settings.browserNotifications ?? true,
    studentAdmissions: settings.studentAdmissions ?? true,
    attendanceAlerts: settings.attendanceAlerts ?? true,
    gradingUpdates: settings.gradingUpdates ?? true,
    assignmentSubmissions: settings.assignmentSubmissions ?? true,
    feePayments: settings.feePayments ?? true,
    importantAnnouncements: settings.importantAnnouncements ?? true,
    systemUpdates: settings.systemUpdates ?? true,
    weeklyReports: settings.weeklyReports ?? true,
    monthlyReports: settings.monthlyReports ?? true,
  });

  const handleToggle = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  async function onSave() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/school-admin/settings/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            ...(school?.settings || {}),
            notifications: notificationPrefs,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification settings");
      }

      toast.success("Notification settings updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update notification settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to receive notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">General Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationPrefs.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-notifications">
                  Browser Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications
                </p>
              </div>
              <Switch
                id="browser-notifications"
                checked={notificationPrefs.browserNotifications}
                onCheckedChange={() => handleToggle("browserNotifications")}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Activity Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Activity Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="student-admissions">Student Admissions</Label>
                <p className="text-sm text-muted-foreground">
                  New student registrations and applications
                </p>
              </div>
              <Switch
                id="student-admissions"
                checked={notificationPrefs.studentAdmissions}
                onCheckedChange={() => handleToggle("studentAdmissions")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="attendance-alerts">Attendance Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Low attendance warnings and alerts
                </p>
              </div>
              <Switch
                id="attendance-alerts"
                checked={notificationPrefs.attendanceAlerts}
                onCheckedChange={() => handleToggle("attendanceAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="grading-updates">Grading Updates</Label>
                <p className="text-sm text-muted-foreground">
                  New grades and assessment results
                </p>
              </div>
              <Switch
                id="grading-updates"
                checked={notificationPrefs.gradingUpdates}
                onCheckedChange={() => handleToggle("gradingUpdates")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="assignment-submissions">
                  Assignment Submissions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Student assignment submissions and updates
                </p>
              </div>
              <Switch
                id="assignment-submissions"
                checked={notificationPrefs.assignmentSubmissions}
                onCheckedChange={() => handleToggle("assignmentSubmissions")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fee-payments">Fee Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Fee collection and payment updates
                </p>
              </div>
              <Switch
                id="fee-payments"
                checked={notificationPrefs.feePayments}
                onCheckedChange={() => handleToggle("feePayments")}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* System Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">System & Reports</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="important-announcements">
                  Important Announcements
                </Label>
                <p className="text-sm text-muted-foreground">
                  Critical updates and platform announcements
                </p>
              </div>
              <Switch
                id="important-announcements"
                checked={notificationPrefs.importantAnnouncements}
                onCheckedChange={() => handleToggle("importantAnnouncements")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Platform maintenance and feature updates
                </p>
              </div>
              <Switch
                id="system-updates"
                checked={notificationPrefs.systemUpdates}
                onCheckedChange={() => handleToggle("systemUpdates")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly activity summary via email
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={notificationPrefs.weeklyReports}
                onCheckedChange={() => handleToggle("weeklyReports")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthly-reports">Monthly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Monthly analytics and insights
                </p>
              </div>
              <Switch
                id="monthly-reports"
                checked={notificationPrefs.monthlyReports}
                onCheckedChange={() => handleToggle("monthlyReports")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.refresh()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
