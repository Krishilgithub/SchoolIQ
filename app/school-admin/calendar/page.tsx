import { Metadata } from "next";
import { CalendarView } from "./_components/calendar-view";

export const metadata: Metadata = {
  title: "School Calendar | SchoolIQ",
  description: "Manage school events, holidays, and deadlines",
};

export default function CalendarPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Manage your school's schedule, holidays, and events.
          </p>
        </div>
      </div>
      <CalendarView />
    </div>
  );
}
