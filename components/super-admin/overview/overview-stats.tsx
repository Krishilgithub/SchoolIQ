"use client";

import { StatMetric } from "@/lib/services/super-admin";
import { StatCard } from "./stat-card";
import { Activity, Building2, DollarSign, Ticket, Users } from "lucide-react";

interface OverviewStatsProps {
  stats: StatMetric[];
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  // Map icons to labels - simplistic mapping for now
  const getIcon = (label: string) => {
    if (label.includes("Schools")) return <Building2 className="h-5 w-5" />;
    if (label.includes("Users") || label.includes("Students"))
      return <Users className="h-5 w-5" />;
    if (label.includes("Revenue") || label.includes("MRR"))
      return <DollarSign className="h-5 w-5" />;
    if (label.includes("Uptime") || label.includes("Health"))
      return <Activity className="h-5 w-5" />;
    if (label.includes("Ticket")) return <Ticket className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const getHref = (label: string) => {
    if (label.includes("Schools")) return "/super-admin/schools";
    if (label.includes("Users") || label.includes("Students"))
      return "/super-admin/users";
    if (label.includes("Tickets")) return "/super-admin/support";
    return undefined;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          trend={stat.trend}
          icon={getIcon(stat.label)}
          index={i}
          href={getHref(stat.label)}
        />
      ))}
    </div>
  );
}
