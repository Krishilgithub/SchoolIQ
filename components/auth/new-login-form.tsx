"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
        // Fetch user role
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_super_admin")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Fallback to default dashboard if profile fetch fails
          router.push("/dashboard");
        } else {
          toast.success("Welcome back!");

          // Determine redirect URL based on role
          let redirectUrl = "/dashboard"; // Default for admin/teacher

          console.log("Login successful, profile:", userProfile);

          if (userProfile?.is_super_admin) {
            redirectUrl = "/super-admin";
          } else if (userProfile?.role === "student") {
            redirectUrl = "/dashboard/student";
          } else if (userProfile?.role === "parent") {
            redirectUrl = "/dashboard/parent";
          } else if(userProfile?.role === "admin"){
            redirectUrl = "/dashboard/admin";
          }

          router.push(redirectUrl);
        }

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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Sign in to access your school dashboard
        </p>
      </div>

      {/* Social Login Buttons */}
      <SocialLoginButtons isLoading={isLoading} />

      {/* Divider */}
      <AuthDivider />

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">
                  Work Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@school.edu"
                      className="pl-10"
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
                  <FormLabel className="text-neutral-700 dark:text-neutral-300">
                    Password
                  </FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Enter your password"
                    disabled={isLoading}
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
            />
            <label
              htmlFor="remember"
              className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer"
            >
              Keep me signed in for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white"
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

      {/* Sign Up Link */}
      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>

      {/* Footer */}
      <p className="text-center text-xs text-neutral-400 mt-8">
        © {new Date().getFullYear()} SchoolIQ. All rights reserved.
      </p>
    </div>
  );
}
