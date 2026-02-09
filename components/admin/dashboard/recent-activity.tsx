"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "@/lib/api/admin-mock";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

interface RecentActivityWidgetProps {
  tickets: Ticket[];
}

export function RecentActivityWidget({ tickets }: RecentActivityWidgetProps) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <ShieldAlert className="h-4 w-4" /> Recent Incidents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    ticket.priority === "Critical"
                      ? "destructive"
                      : ticket.priority === "High"
                        ? "default"
                        : "secondary"
                  }
                  className="w-20 justify-center"
                >
                  {ticket.priority}
                </Badge>
                <div>
                  <p className="text-sm font-medium font-heading">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.user} • {ticket.created}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {ticket.id}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
