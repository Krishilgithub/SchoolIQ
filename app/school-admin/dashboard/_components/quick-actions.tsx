"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Megaphone,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: "blue" | "purple" | "green" | "amber" | "pink" | "indigo";
}

const actions: QuickAction[] = [
  {
    label: "Add Student",
    icon: UserPlus,
    href: "/school-admin/students/new",
    color: "blue",
  },
  {
    label: "Add Teacher",
    icon: GraduationCap,
    href: "/school-admin/teachers/new",
    color: "purple",
  },
  {
    label: "Create Class",
    icon: BookOpen,
    href: "/school-admin/academics/classes/new",
    color: "green",
  },
  {
    label: "Record Attendance",
    icon: ClipboardCheck,
    href: "/school-admin/operations/attendance",
    color: "amber",
  },
  {
    label: "New Announcement",
    icon: Megaphone,
    href: "/school-admin/communication/announcements/new",
    color: "pink",
  },
  {
    label: "View Reports",
    icon: BarChart3,
    href: "/school-admin/analytics",
    color: "indigo",
  },
];

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  green: "bg-green-50 text-green-600 hover:bg-green-100",
  amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  pink: "bg-pink-50 text-pink-600 hover:bg-pink-100",
  indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
};

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-auto flex-col gap-2 p-4 w-full",
                    colorClasses[action.color],
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">
                    {action.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
