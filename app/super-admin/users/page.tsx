import { superAdminService, SuperAdminUser } from "@/lib/services/super-admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { UserActions } from "./user-actions";

export default async function UsersPage() {
  const users = await superAdminService.getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Users
          </h2>
          <p className="text-muted-foreground">
            Manage all users, admins, and staff across the platform.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    School
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: SuperAdminUser) => {
                  // Correctly accessing the joined data
                  // school_members is an array because of the one-to-many potential (or just how Supabase returns it)
                  // But typically a user belongs to one school in this model? Or multiple?
                  // Assuming array for safety.
                  const membership = user.school_admins?.[0];
                  const schoolName = membership?.schools?.name || "N/A";
                  const role =
                    membership?.role ||
                    (user.is_super_admin ? "Super Admin" : "User");
                  const isSuspended = user.is_suspended || false;

                  return (
                    <tr
                      key={user.id}
                      className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                        isSuspended ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback>
                              {user.first_name?.[0]}
                              {user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-foreground">
                              {user.first_name} {user.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.is_super_admin ? "default" : "outline"}
                          className="capitalize"
                        >
                          {role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {schoolName}
                      </td>
                      <td className="px-4 py-3">
                        {isSuspended ? (
                          <Badge variant="destructive" className="text-xs">
                            Suspended
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80"
                          >
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UserActions
                          userId={user.id}
                          isSuspended={isSuspended}
                          userName={`${user.first_name} ${user.last_name}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
