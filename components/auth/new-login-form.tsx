"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import Link from "next/link";
import { toast } from "sonner";

export function NewLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Fetch user profile and role
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("is_super_admin, school_id, role, schools(name)")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast.error("Unable to load user profile. Please try again.");
          return;
        }

        // Check if super admin first
        if (userProfile?.is_super_admin) {
          toast.success("Welcome back, Super Admin!");
          router.push("/super-admin");
          router.refresh();
          return;
        }

        // Check if user has a school assigned
        if (!userProfile?.school_id) {
          console.error("No school assigned to user");
          toast.error(
            "No school assigned to your account. Please contact your administrator.",
          );
          return;
        }

        toast.success("Welcome back!");

        // Determine redirect URL based on role
        let redirectUrl = "/dashboard"; // Default

        console.log("Login successful, user profile:", userProfile);

        switch (userProfile.role) {
          case "student":
            redirectUrl = "/dashboard/student";
            break;
          case "guardian":
            redirectUrl = "/dashboard/parent";
            break;
          case "school_admin":
            redirectUrl = "/dashboard/admin";
            break;
          case "teacher":
            redirectUrl = "/dashboard"; // Teacher dashboard
            break;
          default:
            redirectUrl = "/dashboard";
        }

        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Sign in to access your school dashboard
        </p>
      </motion.div>

      {/* Social Login Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SocialLoginButtons isLoading={isLoading} />
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <AuthDivider />
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 dark:text-neutral-300 font-medium">
                    Work Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-brand-600 transition-colors" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="name@school.edu"
                        className="pl-10 h-11 border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-neutral-700 dark:text-neutral-300 font-medium">
                      Password
                    </FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className="h-11 border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
              />
              <label
                htmlFor="remember"
                className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer select-none"
              >
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* Sign Up Link */}
      <motion.p
        className="text-center text-sm text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-brand-600 hover:text-brand-700 font-medium hover:underline transition-colors"
        >
          Create an account
        </Link>
      </motion.p>

      {/* Footer */}
      <motion.p
        className="text-center text-xs text-neutral-400 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        © {new Date().getFullYear()} SchoolIQ. All rights reserved.
      </motion.p>
    </div>
  );
}
