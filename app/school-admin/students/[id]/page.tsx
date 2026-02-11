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
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface StudentProfilePageProps {
  params: {
    id: string;
  };
}

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) redirect("/auth/login");

  const supabase = createClient();
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.id)
    .eq("school_id", schoolId)
    .single();

  if (error || !student) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Student Profile</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={student.avatar_url}
                  alt={student.first_name}
                />
                <AvatarFallback className="text-2xl">
                  {student.first_name[0]}
                  {student.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-xl">
                  {student.first_name} {student.last_name}
                </CardTitle>
                <CardDescription>
                  Grade {student.grade_level} - {student.section}
                </CardDescription>
                <Badge
                  variant={
                    student.status === "active" ? "default" : "secondary"
                  }
                  className="mt-2"
                >
                  {student.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {student.email}
              </div>
              {student.address && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {student.address}
                </div>
              )}
              {student.date_of_birth && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  DOB: {format(new Date(student.date_of_birth), "PPP")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-5">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="parent" className="space-y-4">
              <TabsList>
                <TabsTrigger value="parent">Parent Info</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>
              <TabsContent value="parent" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">
                      Parent Name
                    </label>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-2 h-4 w-4" />
                      {student.parent_name || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">
                      Parent Email
                    </label>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {student.parent_email || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">
                      Parent Phone
                    </label>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {student.parent_phone || "N/A"}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="academic">
                <div className="text-sm text-muted-foreground">
                  Academic records will appear here.
                </div>
              </TabsContent>
              <TabsContent value="attendance">
                <div className="text-sm text-muted-foreground">
                  Attendance records will appear here.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
