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
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Logo textClassName="text-neutral-900" />
      </Link>

      <Card className="w-full max-w-md bg-white border-neutral-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-neutral-900">
            Reset password
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="bg-white border-neutral-200"
            />
          </div>
          <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">
            Send Reset Link
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
