"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function InterventionTracker() {
  const interventions = [
    {
      id: 1,
      student: "Alice Smith",
      plan: "Reading Recovery",
      progress: 65,
      status: "Active",
      mentor: "Mrs. Davis",
    },
    {
      id: 2,
      student: "Bob Jones",
      plan: "Math Support",
      progress: 30,
      status: "Review Needed",
      mentor: "Mr. Clark",
    },
    {
      id: 3,
      student: "Charlie Brown",
      plan: "Behavioral Plan",
      progress: 90,
      status: "Completed",
      mentor: "Dr. Lee",
    },
  ];

  return (
    <div className="grid gap-4">
      {interventions.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{item.student[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{item.student}</p>
                <Badge
                  variant={item.status === "Active" ? "default" : "secondary"}
                >
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.plan} • Mentor: {item.mentor}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Progress value={item.progress} className="h-2" />
                <span>{item.progress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
