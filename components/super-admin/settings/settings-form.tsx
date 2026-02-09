"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock save
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("Settings saved successfully.");
  };

  return (
    <Tabs defaultValue="general" className="w-[800px]">
      <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
        <TabsTrigger
          value="general"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
        >
          General
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
        >
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card className="border-slate-200/60 bg-white shadow-sm mt-6">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your public profile and preferences.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  defaultValue="Super Administrator"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue="admin@schooliq.com"
                  disabled
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <Button
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card className="border-slate-200/60 bg-white shadow-sm mt-6">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change your password and manage sessions.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  className="bg-white border-slate-200"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <Button
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
