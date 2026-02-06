"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Mock Login Function
  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, just show success or error based on email
      if (data.email.includes("error")) {
        setError("Invalid email or password. Please try again.");
      } else {
        // Redirect logic would go here
        console.log("Login successful", data);
      }
    }, 1500);
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 mb-2">
          Welcome back
        </h2>
        <p className="text-neutral-500">
          Sign in to access your school dashboard
        </p>
      </div>

      <div className="space-y-6">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-neutral-50 border-neutral-200 h-11 relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-neutral-100/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2 relative z-10"
            />
            <span className="relative z-10 font-medium text-neutral-700">
              Google
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-neutral-50 border-neutral-200 h-11 relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-neutral-100/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <img
              src="https://www.svgrepo.com/show/452263/microsoft.svg"
              alt="Microsoft"
              className="w-5 h-5 mr-2 relative z-10"
            />
            <span className="relative z-10 font-medium text-neutral-700">
              Microsoft
            </span>
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 px-2 text-neutral-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <Alert
                  variant="destructive"
                  className="bg-red-50 text-red-900 border-red-200 mb-4"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <div className="relative group">
              <Input
                id="email"
                type="email"
                placeholder="name@school.edu"
                disabled={isLoading}
                className={cn(
                  "h-11 bg-white border-neutral-200 pl-10 transition-all duration-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                  form.formState.errors.email &&
                    "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                )}
                {...form.register("email")}
              />
              <div className="absolute left-3 top-3 text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 flex items-center mt-1 animate-in slide-in-from-top-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-brand-600 hover:text-brand-500 hover:underline transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                className={cn(
                  "h-11 bg-white border-neutral-200 pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                  form.formState.errors.password &&
                    "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                )}
                {...form.register("password")}
              />
              <div className="absolute left-3 top-3 text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 flex items-center mt-1 animate-in slide-in-from-top-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="remember"
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked as boolean)
              }
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-600 select-none"
            >
              Keep me signed in for 30 days
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-medium text-base shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-6"
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

        <div className="text-center pt-4">
          <p className="text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
