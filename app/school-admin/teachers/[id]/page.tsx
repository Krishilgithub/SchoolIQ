import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, BookOpen, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface TeacherProfilePageProps {
  params: {
    id: string;
  };
}

export default async function TeacherProfilePage({
  params,
}: TeacherProfilePageProps) {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) redirect("/login");

  const supabase = createClient();
  const { data: teacher, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .eq("school_id", schoolId)
    .eq("role", "teacher")
    .single();

  if (error || !teacher) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Profile</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={teacher.avatar_url} alt={teacher.full_name} />
                <AvatarFallback className="text-2xl">
                  {teacher.full_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-xl">{teacher.full_name}</CardTitle>
                <CardDescription>
                  {teacher.specialization || "General Teacher"}
                </CardDescription>
                <Badge variant="outline" className="mt-2">
                  Teacher
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {teacher.email}
              </div>
              {teacher.phone_number && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {teacher.phone_number}
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Joined: {format(new Date(teacher.created_at), "PPP")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-5">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>
              <TabsContent value="classes" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span>Assigned Classes will appear here.</span>
                  </div>
                  {/* TODO: Fetch and display assigned classes/subjects */}
                </div>
              </TabsContent>
              <TabsContent value="schedule">
                <div className="text-sm text-muted-foreground">
                  Timetable/Schedule will appear here.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
