import Link from "next/link";
import { MoreVertical, School, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardSchool } from "@/lib/services/super-admin";

export function RecentSchools({ schools }: { schools: DashboardSchool[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading">
          Recent Schools
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="pb-3 pl-2 font-medium w-10">
                <input type="checkbox" className="rounded border-border" />
              </th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {schools.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No schools found.
                </td>
              </tr>
            ) : (
              schools.map((school) => (
                <tr
                  key={school.id}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 pl-2">
                    <div className="h-4 w-4 rounded border border-input flex items-center justify-center">
                      {/* Checkbox implementation if needed */}
                    </div>
                  </td>
                  <td className="py-4 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
                        {school.logo_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={school.logo_url}
                            alt={school.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <School className="h-4 w-4" />
                        )}
                      </div>
                      <span>{school.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs text-muted-foreground uppercase">
                    {school.slug.substring(0, 6)}
                  </td>
                  <td className="py-4 capitalize text-muted-foreground">
                    {school.school_type.replace(/_/g, " ")}
                  </td>
                  <td className="py-4 text-right">
                    <Badge
                      variant={
                        school.subscription_status === "active"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {school.subscription_status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing recent {schools.length} schools
        </p>
        <Link href="/super-admin/schools">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
          >
            View All <ChevronsRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
