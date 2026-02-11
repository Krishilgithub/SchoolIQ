"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModerationService } from "@/lib/services/moderation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/database.types";

type ModerationRequest = Database["public"]["Tables"]["moderation_requests"]["Row"];

export default function ModerationQueuePage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [selectedRequest, setSelectedRequest] = useState<ModerationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const status = filter === "all" ? undefined : filter;
      const data = await ModerationService.getModerationRequests({ status });
      setRequests(data);
    } catch (error) {
      console.error("Error loading moderation requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await ModerationService.approveMarks(requestId, remarks);
      toast({
        title: "Success",
        description: "Marks approved successfully",
      });
      setDialogOpen(false);
      setRemarks("");
      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve marks",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await ModerationService.rejectMarks(requestId, remarks);
      toast({
        title: "Success",
        description: "Marks rejected",
      });
      setDialogOpen(false);
      setRemarks("");
      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject marks",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/exams">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Moderation Queue
            </h2>
            <p className="text-muted-foreground">
              Review and approve student marks
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Requests
              </p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Approved
              </p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter((r) => r.status === "approved").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rejected
              </p>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter((r) => r.status === "rejected").length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </motion.div>

      {/* Moderation Table */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <Card>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    No moderation requests found
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Paper</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.exam_paper_id}
                        </TableCell>
                        <TableCell>{request.submitted_by}</TableCell>
                        <TableCell>
                          {new Date(request.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(request.priority || "medium")}>
                            {request.priority || "medium"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setDialogOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Marks Submission</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Exam Paper</p>
                  <p className="font-medium">{selectedRequest.exam_paper_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{selectedRequest.submitted_by}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks</label>
                <Textarea
                  placeholder="Add your remarks here..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setRemarks("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleReject(selectedRequest.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedRequest.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
