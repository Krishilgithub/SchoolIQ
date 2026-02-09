"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  MoreVertical,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SchoolDetailsHeaderProps {
  school: {
    id: string;
    name: string;
    contact_email: string;
    subscription_status: string;
    created_at: string;
    school_type?: string;
  };
}

export function SchoolDetailsHeader({ school }: SchoolDetailsHeaderProps) {
  const handleAction = (action: string) => {
    toast.info(`${action} action triggered for ${school.name}`);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link href="/super-admin/schools">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to schools</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 font-bold text-xl border border-orange-200">
              {school.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {school.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {school.contact_email}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {new Date(school.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:pl-[68px]">
          <Badge
            variant={
              school.subscription_status === "active" ? "default" : "secondary"
            }
            className={
              school.subscription_status === "active"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
            }
          >
            {school.subscription_status.charAt(0).toUpperCase() +
              school.subscription_status.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-slate-600">
            {school.school_type || "K12 School"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 md:mt-2">
        <Button variant="outline" onClick={() => handleAction("Sync")}>
          Sync Data
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Actions
              <MoreVertical className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage School</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleAction("Edit")}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("Manage Subscription")}
            >
              Manage Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
              onClick={() => handleAction("Suspend")}
            >
              <ShieldAlert className="mr-2 h-4 w-4" /> Suspend School
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-50"
              onClick={() => handleAction("Delete")}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete School
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20">
          View Analytics
        </Button>
      </div>
    </div>
  );
}
