"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, History } from "lucide-react";

export function FeeStatusCard() {
  return (
    <Card className="col-span-full lg:col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-medium text-slate-100 flex items-center justify-between">
          <span>Fee Status</span>
          <span className="text-xs font-normal text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
            Payment Due
          </span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Academic Year 2023-24 • Term 2
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold tracking-tight">$1,200</span>
          <span className="text-sm text-slate-400 ml-2">outstanding</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm border-b border-slate-700/50 pb-2">
            <span className="text-slate-400">Tuition Fee</span>
            <span>$1,000</span>
          </div>
          <div className="flex justify-between text-sm border-b border-slate-700/50 pb-2">
            <span className="text-slate-400">Transport</span>
            <span>$200</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-3 pt-2">
        <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white border-0">
          <CreditCard className="mr-2 h-4 w-4" /> Pay Now
        </Button>
        <Button
          variant="outline"
          className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <History className="mr-2 h-4 w-4" /> History
        </Button>
      </CardFooter>
    </Card>
  );
}
