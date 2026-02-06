"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Logo } from "@/components/marketing/logo";
import { Search, School } from "lucide-react";

export default function SelectSchoolPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Logo textClassName="text-neutral-900" />
      </Link>

      <Card className="w-full max-w-md bg-white border-neutral-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-neutral-900">
            Find your school
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Search for your school to continue to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by school name or code..."
              className="pl-9 bg-white border-neutral-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Recent Searches
            </Label>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 p-3 text-left bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-transparent hover:border-neutral-200 transition-all group">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                  <School className="h-5 w-5 text-neutral-500 group-hover:text-brand-600 transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-sm text-neutral-900">
                    St. Xavier&aposs High School
                  </div>
                  <div className="text-xs text-neutral-500">Mumbai, India</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-transparent hover:border-neutral-200 transition-all group">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                  <School className="h-5 w-5 text-neutral-500 group-hover:text-brand-600 transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-sm text-neutral-900">
                    Global Public School
                  </div>
                  <div className="text-xs text-neutral-500">London, UK</div>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500">
          Can&apos;t find your school?{" "}
          <Link
            href="/contact"
            className="text-brand-600 hover:text-brand-500 font-medium"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
