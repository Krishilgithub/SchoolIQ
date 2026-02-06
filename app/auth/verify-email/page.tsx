"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Logo } from "@/components/marketing/logo";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Logo textClassName="text-neutral-900" />
      </Link>

      <Card className="w-full max-w-md bg-white border-neutral-200 shadow-sm text-center">
        <CardHeader className="pb-0">
          <div className="mx-auto w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-brand-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900">
            Check your inbox
          </CardTitle>
          <CardDescription className="text-neutral-500 mt-2">
            We&apos;ve sent a verification link to your email address. Please
            click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-4">
          <div className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            Did not receive the email? Check your spam folder or try again.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button variant="outline" className="w-full border-neutral-200">
            Resend Email
          </Button>
          <Link
            href="/login"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
