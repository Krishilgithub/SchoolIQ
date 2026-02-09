import { format } from "date-fns";

interface DashboardHeaderProps {
  userEmail?: string;
  avatarUrl?: string | null;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
        Welcome, Super Admin.
      </h1>
      <p className="text-muted-foreground">
        Navigate the future of education with SchoolIQ. Today is{" "}
        <span className="font-medium text-foreground">
          {format(new Date(), "MMMM d, yyyy")}
        </span>
        .
      </p>
    </div>
  );
}
