"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    user: {
      name: "Roberta Casas",
      image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      initials: "RC",
    },
    action: "submitted leave request",
    time: "2 minutes ago",
  },
  {
    user: {
      name: "John Doe",
      image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      initials: "JD",
    },
    action: "posted a new announcement",
    time: "15 minutes ago",
  },
  {
    user: {
      name: "System",
      initials: "SYS",
    },
    action: "Automatic backup completed",
    time: "1 hour ago",
  },
  {
    user: {
      name: "Maria Garcia",
      image: "https://i.pravatar.cc/150?u=a048581f4e29026704d",
      initials: "MG",
    },
    action: "updated gradebook for Class 10-A",
    time: "2 hours ago",
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div className="flex items-center" key={index}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.image} alt="Avatar" />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    {activity.action}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
