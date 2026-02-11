"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ResultService } from "@/lib/services/result";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calculator, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function CalculateResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const handleCalculate = async () => {
    if (!selectedExam) {
      toast({
        title: "Error",
        description: "Please select an exam",
        variant: "destructive",
      });
      return;
    }

    setCalculating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      // Calculate results
      await ResultService.calculateExamResults(selectedExam);

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: "Success",
        description: "Results calculated successfully",
      });

      setTimeout(() => {
        router.push("/dashboard/results");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate results",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/results">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Calculate Results
            </h2>
            <p className="text-muted-foreground">
              Process exam marks and generate student results
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-orange-600" />
                Select Exam
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="exam">Exam *</Label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam1">Mid-Term Exam 2024</SelectItem>
                      <SelectItem value="exam2">Final Exam 2024</SelectItem>
                      <SelectItem value="exam3">Unit Test 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class/Section (Optional)</Label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="class1">Class 10A</SelectItem>
                      <SelectItem value="class2">Class 10B</SelectItem>
                      <SelectItem value="class3">Class 9A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Calculation Options */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Calculation Options</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Calculate rankings</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Generate analytics</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Auto-publish results</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">
                    Send notifications to students/parents
                  </span>
                </label>
              </div>
            </div>

            {/* Progress */}
            {calculating && (
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing...</span>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                {progress === 100 && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Calculation complete!
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <Link href="/dashboard/results">
                <Button
                  type="button"
                  variant="outline"
                  disabled={calculating}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleCalculate}
                disabled={calculating || !selectedExam}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {calculating ? (
                  "Calculating..."
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Results
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-2 flex items-center text-blue-900 dark:text-blue-100">
            <CheckCircle className="mr-2 h-5 w-5" />
            What happens during calculation?
          </h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Individual subject marks are aggregated</li>
            <li>• Total marks, percentages, and grades are calculated</li>
            <li>• Class, section, and school rankings are generated</li>
            <li>• Performance analytics and trends are computed</li>
            <li>• Results are saved as draft (unless auto-publish is enabled)</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
