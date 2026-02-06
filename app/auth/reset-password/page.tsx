"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Logo } from "@/components/marketing/logo";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Logo textClassName="text-neutral-900" />
      </Link>

      <Card className="w-full max-w-md bg-white border-neutral-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-neutral-900">
            Set new password
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              className="bg-white border-neutral-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              className="bg-white border-neutral-200"
            />
          </div>
          <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">
            Reset Password
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-neutral-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-brand-600 hover:text-brand-500 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
