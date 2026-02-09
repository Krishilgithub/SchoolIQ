"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSchool } from "@/lib/services/super-admin";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

interface RecentSignupsProps {
  schools: DashboardSchool[];
}

export function RecentSignups({ schools }: RecentSignupsProps) {
  return (
    <Card className="col-span-3 border-slate-200/60 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-slate-800">
          Recent School Registrations
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <Link href="/super-admin/schools">
            View All <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {schools.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              No recent signups
            </div>
          ) : (
            schools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${school.id}.png`}
                      alt={school.name}
                    />
                    <AvatarFallback className="bg-slate-100 text-slate-600">
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {school.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {/* Mock email for now since it's not in the type, or we could add it */}
                      admin@{school.name.toLowerCase().replace(/\s+/g, "")}.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {school.plan}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(school.lastActive).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      school.status === "Active"
                        ? "default"
                        : school.status === "Suspended"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      school.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none border-0"
                        : school.status === "Suspended"
                          ? "bg-red-100 text-red-700 hover:bg-red-200 shadow-none border-0"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none border-0"
                    }
                  >
                    {school.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
