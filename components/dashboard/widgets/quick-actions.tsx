"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, CalendarPlus, FileText } from "lucide-react";

const actions = [
  {
    label: "Publish Notice",
    icon: Megaphone,
    variant: "default" as const,
  },
  {
    label: "Add Student",
    icon: Plus,
    variant: "outline" as const,
  },
  {
    label: "Schedule Exam",
    icon: CalendarPlus,
    variant: "outline" as const,
  },
  {
    label: "Generate Report",
    icon: FileText,
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className={`w-full justify-start ${
              action.variant === "default"
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
