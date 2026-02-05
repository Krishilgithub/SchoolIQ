import { Student } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileHeader({ student }: { student: Student }) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-accent/20">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`}
              />
              <AvatarFallback className="text-2xl">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-heading">
                  {student.name}
                </h2>
                <Badge
                  variant={student.riskScore > 50 ? "destructive" : "success"}
                  className="rounded-md"
                >
                  {student.riskScore > 50 ? "At Risk" : "Good Standing"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Grade {student.grade} • Roll No: {student.rollNumber}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{student.guardianContact}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              View Marks
            </Button>
            <Button variant="default" size="sm">
              Message Parent
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
