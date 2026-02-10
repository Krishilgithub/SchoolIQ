import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { getAnnouncementsAction } from "@/lib/actions/announcement-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Megaphone, Users, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateAnnouncementModal } from "./_components/create-announcement-modal";

export default async function CommunicationPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/login");
  }

  const announcements = await getAnnouncementsAction(schoolId);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Communication</h2>
          <p className="text-muted-foreground">
            Manage announcements and school-wide communication.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateAnnouncementModal schoolId={schoolId} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {announcements.map((announcement) => (
          <Card
            key={announcement.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  {announcement.title}
                </CardTitle>
                <Badge
                  variant={
                    announcement.status === "published"
                      ? "default"
                      : "secondary"
                  }
                >
                  {announcement.status}
                </Badge>
              </div>
              <CardDescription>
                {format(new Date(announcement.created_at), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {announcement.content}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="capitalize">
                    {announcement.target_audience}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{announcement.author_name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No announcements yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-4">
              Post your first announcement to share updates with students,
              teachers, or parents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
