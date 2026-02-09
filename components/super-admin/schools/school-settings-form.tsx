"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSchoolAction } from "@/app/super-admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface School {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
}

interface SchoolSettingsFormProps {
  school: School;
}

export function SchoolSettingsForm({ school }: SchoolSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: school.name,
    slug: school.slug,
    contact_email: school.contact_email,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateSchoolAction(school.id, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("School settings updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Profile</CardTitle>
        <CardDescription>
          Update the schools core information and contact details.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">School Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Academy"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug (URL Identifier)</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. acme-academy"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact_email">Administrative Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="e.g. admin@acme.com"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-slate-50/50 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
