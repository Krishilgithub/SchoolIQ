"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PeriodService } from "@/lib/services/period";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/database.types";

type Period = Database["public"]["Tables"]["periods"]["Row"];

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export default function PeriodsPage() {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [formData, setFormData] = useState({
    period_name: "",
    start_time: "",
    end_time: "",
    period_type: "class" as "class" | "break" | "lunch" | "assembly",
  });

  useEffect(() => {
    loadPeriods();
  }, [selectedDay]);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const data = await PeriodService.getDaySchedule("", selectedDay);
      setPeriods(data);
    } catch (error) {
      console.error("Error loading periods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await PeriodService.createPeriod({
        ...formData,
        academic_year_id: "", // Will be filled by service
        day_of_week: selectedDay,
      });

      toast({
        title: "Success",
        description: "Period created successfully",
      });

      setDialogOpen(false);
      setFormData({
        period_name: "",
        start_time: "",
        end_time: "",
        period_type: "class",
      });
      loadPeriods();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create period",
        variant: "destructive",
      });
    }
  };

  const getPeriodTypeBadge = (type: string) => {
    const variants = {
      class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      break: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      lunch: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      assembly: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return variants[type as keyof typeof variants] || variants.class;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/timetable">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Period Management
            </h2>
            <p className="text-muted-foreground">
              Define time slots for your school timetable
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Period</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period_name">Period Name</Label>
                <Input
                  id="period_name"
                  placeholder="e.g., Period 1, Lunch Break"
                  value={formData.period_name}
                  onChange={(e) =>
                    setFormData({ ...formData, period_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period_type">Type</Label>
                <select
                  id="period_type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.period_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      period_type: e.target.value as any,
                    })
                  }
                >
                  <option value="class">Class</option>
                  <option value="break">Break</option>
                  <option value="lunch">Lunch</option>
                  <option value="assembly">Assembly</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  Create Period
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day Selector */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {DAYS.map((day) => (
            <Button
              key={day.value}
              variant={selectedDay === day.value ? "default" : "outline"}
              onClick={() => setSelectedDay(day.value)}
              className={
                selectedDay === day.value
                  ? "bg-orange-600 hover:bg-orange-700"
                  : ""
              }
            >
              {day.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Periods Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-orange-600" />
              {DAYS.find((d) => d.value === selectedDay)?.label} Schedule
            </h3>
            <Badge variant="outline">
              {periods.length} {periods.length === 1 ? "Period" : "Periods"}
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                No periods defined for this day
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">
                      {period.period_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPeriodTypeBadge(period.period_type)}>
                        {period.period_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{period.start_time}</TableCell>
                    <TableCell>{period.end_time}</TableCell>
                    <TableCell>{period.duration_minutes} min</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
