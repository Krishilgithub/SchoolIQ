"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const emailConfigSchema = z.object({
  provider: z.enum(["smtp", "sendgrid", "mailgun", "gmail"]),
  smtp_host: z.string().optional(),
  smtp_port: z.number().optional(),
  smtp_user: z.string().optional(),
  smtp_pass: z.string().optional(),
  api_key: z.string().optional(),
  from_email: z.string().email("Invalid email address"),
  from_name: z.string().min(1, "From name is required"),
});

type EmailConfigData = z.infer<typeof emailConfigSchema>;

interface EmailConfigProps {
  defaultValues?: Partial<EmailConfigData>;
  onSave: (data: EmailConfigData) => Promise<void>;
}

export function EmailConfig({ defaultValues, onSave }: EmailConfigProps) {
  const form = useForm<EmailConfigData>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      provider: "smtp",
      smtp_host: "",
      smtp_port: 587,
      smtp_user: "",
      smtp_pass: "",
      api_key: "",
      from_email: "",
      from_name: "",
      ...defaultValues,
    },
  });

  const watchProvider = form.watch("provider");

  const onSubmit = async (data: EmailConfigData) => {
    try {
      await onSave(data);
      toast.success("Email configuration saved");
    } catch (error) {
      toast.error("Failed to save configuration");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Service
        </CardTitle>
        <CardDescription>
          Configure email service for transactional emails and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="gmail">Gmail</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchProvider === "smtp" || watchProvider === "gmail") && (
              <>
                <FormField
                  control={form.control}
                  name="smtp_host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="587"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your-email@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtp_pass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="App password or SMTP password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {watchProvider === "gmail" &&
                          "Use an app-specific password"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(watchProvider === "sendgrid" || watchProvider === "mailgun") && (
              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="API key" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your {watchProvider} API key (encrypted)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="from_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="noreply@schooliq.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email address that will appear as the sender
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="from_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input placeholder="SchoolIQ" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name that will appear as the sender
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Save Configuration</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
