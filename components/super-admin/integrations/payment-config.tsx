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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

const paymentConfigSchema = z.object({
  provider: z.enum(["stripe", "razorpay"]),
  public_key: z.string().min(1, "Public key is required"),
  secret_key: z.string().min(1, "Secret key is required"),
  webhook_secret: z.string().optional(),
  test_mode: z.boolean(),
});

type PaymentConfigData = z.infer<typeof paymentConfigSchema>;

interface PaymentConfigProps {
  defaultValues?: Partial<PaymentConfigData>;
  onSave: (data: PaymentConfigData) => Promise<void>;
}

export function PaymentConfig({ defaultValues, onSave }: PaymentConfigProps) {
  const form = useForm({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      provider: "stripe" as const,
      public_key: "",
      secret_key: "",
      webhook_secret: "",
      test_mode: true,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: PaymentConfigData) => {
    try {
      await onSave(data);
      toast.success("Payment configuration saved");
    } catch (error) {
      toast.error("Failed to save configuration");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Gateway
        </CardTitle>
        <CardDescription>
          Configure payment processing for subscriptions and billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="public_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publishable Key</FormLabel>
                  <FormControl>
                    <Input placeholder="pk_test_..." type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Public API key for client-side integration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secret_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="sk_test_..."
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Secret API key for server-side operations (encrypted)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhook_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Secret (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="whsec_..." type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used to verify webhook signatures
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="test_mode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Test Mode</FormLabel>
                    <FormDescription>
                      Use test API keys for development
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
