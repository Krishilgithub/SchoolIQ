"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TimetableService } from "@/lib/services/timetable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Download,
  Grid3x3,
} from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database.types";

type Timetable = Database["public"]["Tables"]["timetables"]["Row"];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  useEffect(() => {
    loadTimetables();
  }, [filter]);

  const loadTimetables = async () => {
    setLoading(true);
    try {
      const status = filter === "all" ? undefined : filter;
      const data = await TimetableService.getTimetables({ status });
      setTimetables(data);
    } catch (error) {
      console.error("Error loading timetables:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      archived: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Timetable Management
          </h2>
          <p className="text-muted-foreground">
            Create, manage, and publish timetables for your school
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/timetable/periods">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Manage Periods
            </Button>
          </Link>
          <Link href="/dashboard/timetable/rooms">
            <Button variant="outline">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Manage Rooms
            </Button>
          </Link>
          <Link href="/dashboard/timetable/substitutions">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Substitutions
            </Button>
          </Link>
          <Link href="/dashboard/timetable/create">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Timetable
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Timetables
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {timetables.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {timetables.filter((t) => t.status === "published").length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Drafts
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {timetables.filter((t) => t.status === "draft").length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conflicts
                </p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </Card>
              ))}
            </div>
          ) : timetables.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No timetables found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first timetable
              </p>
              <Link href="/dashboard/timetable/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Timetable
                </Button>
              </Link>
            </Card>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {timetables.map((timetable) => (
                <motion.div key={timetable.id} variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {timetable.name}
                        </h3>
                        <Badge className={getStatusBadge(timetable.status)}>
                          {timetable.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Academic Year: {timetable.academic_year_id}
                      </div>
                      {timetable.effective_from && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          From: {new Date(timetable.effective_from).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {timetable.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {timetable.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/timetable/${timetable.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/timetable/${timetable.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
