"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const fees = {
  due: [
    {
      id: "INV-2024-001",
      student: "Sarah Thompson",
      description: "Tuition Fee - Term 2",
      amount: 450.0,
      dueDate: "2024-02-28",
      status: "overdue",
    },
  ],
  history: [
    {
      id: "INV-2023-012",
      student: "Alex Thompson",
      description: "Tuition Fee - Term 2",
      amount: 450.0,
      paidDate: "2024-01-15",
      method: "Credit Card ending 4242",
      status: "paid",
    },
    {
      id: "INV-2023-011",
      student: "Sarah Thompson",
      description: "Annual Transport Fee",
      amount: 200.0,
      paidDate: "2023-12-10",
      method: "Bank Transfer",
      status: "paid",
    },
    {
      id: "INV-2023-010",
      student: "Alex Thompson",
      description: "Computer Lab Fee",
      amount: 50.0,
      paidDate: "2023-12-10",
      method: "Bank Transfer",
      status: "paid",
    },
  ],
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function FeesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Fees & Payments
        </h2>
        <p className="text-muted-foreground">
          Manage school fee payments and view transaction history.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Summary Card */}
          <motion.div variants={item}>
            <Card className="bg-slate-900 text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-200 text-sm font-medium uppercase tracking-wider">
                  Total Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-4">$450.00</div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div variants={item}>
            <Card className="h-full bg-slate-50 border-dashed">
              <CardHeader>
                <CardTitle className="text-slate-700">
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <p>• Payments are processed securely via Stripe.</p>
                <p>• Tuition fees are due on the 5th of every month.</p>
                <p>• Late payments may incur a 5% surcharge.</p>
                <div className="pt-2 text-xs text-slate-400">
                  Need help? Contact accounts@schooliq.edu
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transactions Tabs */}
        <motion.div variants={item}>
          <Tabs defaultValue="due" className="space-y-4">
            <TabsList>
              <TabsTrigger value="due" className="relative">
                Due Payments
                {fees.due.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="due">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payments</CardTitle>
                  <CardDescription>
                    Invoices waiting for payment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees.due.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.id}
                          </TableCell>
                          <TableCell>{invoice.student}</TableCell>
                          <TableCell>{invoice.description}</TableCell>
                          <TableCell className="text-red-600 font-medium">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="destructive"
                              className="flex w-fit items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" /> Overdue
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm">Pay</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {fees.due.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-slate-500"
                          >
                            No pending payments. You&apos;re all caught up!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Record of all past payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees.history.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium text-slate-600">
                            {invoice.id}
                          </TableCell>
                          <TableCell>{invoice.student}</TableCell>
                          <TableCell>{invoice.description}</TableCell>
                          <TableCell>
                            {new Date(invoice.paidDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs">
                            {invoice.method}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Paid
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4 text-slate-400" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
