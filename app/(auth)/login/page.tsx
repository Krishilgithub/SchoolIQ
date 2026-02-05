"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { School, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [deviceTrusted, setDeviceTrusted] = useState(false);

  // Simulate device check
  useEffect(() => {
    const timer = setTimeout(() => setDeviceTrusted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "demo@schooliq.com",
      password: "demo",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back, Rahul!", {
        description: "Authenticated securely from recognized device.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Authentication Failed", {
        description: err.message || "Please check your credentials.",
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center pb-2">
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/20"
              >
                <School className="h-8 w-8" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter credentials to access workspace
            </CardDescription>

            {/* Device Security Badge */}
            <div className="flex justify-center pt-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-500 ${deviceTrusted ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500"}`}
              >
                {deviceTrusted ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Recognized Device</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Device...</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="name@school.com"
                  {...form.register("email")}
                  className="h-11 bg-white dark:bg-slate-950/50"
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  className="h-11 bg-white dark:bg-slate-950/50"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold mt-2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 dark:bg-slate-900/50 p-6">
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/contact"
                className="text-brand-600 hover:underline font-medium"
              >
                Contact Sales
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>
          &copy; 2024 SchoolIQ Inc. &bull; Enterprise Security &bull; Privacy
        </p>
      </div>
    </div>
  );
}
