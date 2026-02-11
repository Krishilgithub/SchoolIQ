"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Eye,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Share2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { scale: 0.9, opacity: 0 },
  show: { scale: 1, opacity: 1 },
};

// Mock resources
const resources = [
  {
    id: 1,
    title: "Calculus Lecture Notes - Chapter 5",
    description:
      "Comprehensive notes covering integration and differential equations",
    type: "document",
    subject: "Mathematics",
    uploadedBy: "Dr. Smith",
    uploadDate: "2024-02-10",
    size: "2.4 MB",
    views: 145,
    downloads: 67,
    bookmarked: true,
    tags: ["calculus", "integration", "notes"],
    fileUrl: "/resources/math-ch5.pdf",
  },
  {
    id: 2,
    title: "Quantum Mechanics Video Lecture",
    description:
      "Introduction to quantum mechanics principles and wave functions",
    type: "video",
    subject: "Physics",
    uploadedBy: "Prof. Johnson",
    uploadDate: "2024-02-12",
    duration: "45:30",
    views: 89,
    downloads: 0,
    bookmarked: false,
    tags: ["quantum", "physics", "video"],
    fileUrl: "https://youtube.com/watch?v=example",
  },
  {
    id: 3,
    title: "English Literature Study Guide",
    description:
      "Complete study guide for Shakespeare's works and analysis techniques",
    type: "document",
    subject: "English",
    uploadedBy: "Ms. Davis",
    uploadDate: "2024-02-08",
    size: "1.8 MB",
    views: 203,
    downloads: 112,
    bookmarked: true,
    tags: ["literature", "shakespeare", "guide"],
    fileUrl: "/resources/eng-guide.pdf",
  },
  {
    id: 4,
    title: "Chemistry Lab Safety Guidelines",
    description:
      "Essential safety protocols and procedures for chemistry lab work",
    type: "document",
    subject: "Chemistry",
    uploadedBy: "Dr. Brown",
    uploadDate: "2024-02-05",
    size: "950 KB",
    views: 178,
    downloads: 145,
    bookmarked: false,
    tags: ["safety", "lab", "procedures"],
    fileUrl: "/resources/chem-safety.pdf",
  },
  {
    id: 5,
    title: "Python Programming Tutorial",
    description:
      "Interactive tutorial covering Python basics and advanced concepts",
    type: "link",
    subject: "Computer Science",
    uploadedBy: "Mr. Wilson",
    uploadDate: "2024-02-13",
    views: 134,
    downloads: 0,
    bookmarked: true,
    tags: ["python", "programming", "tutorial"],
    fileUrl: "https://python-tutorial.example.com",
  },
  {
    id: 6,
    title: "Thermodynamics Problem Solutions",
    description: "Step-by-step solutions to thermodynamics practice problems",
    type: "document",
    subject: "Physics",
    uploadedBy: "Prof. Johnson",
    uploadDate: "2024-02-11",
    size: "3.2 MB",
    views: 167,
    downloads: 98,
    bookmarked: false,
    tags: ["thermodynamics", "solutions", "practice"],
    fileUrl: "/resources/thermo-solutions.pdf",
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "video":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "link":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const bookmarkedResources = resources.filter((r) => r.bookmarked);
  const documentCount = resources.filter((r) => r.type === "document").length;
  const videoCount = resources.filter((r) => r.type === "video").length;
  const linkCount = resources.filter((r) => r.type === "link").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Learning Resources
          </h2>
          <p className="text-muted-foreground">
            Access study materials, videos, and helpful links
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Bookmark className="mr-2 h-4 w-4" />
          My Bookmarks ({bookmarkedResources.length})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resources
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">Available materials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {documentCount}
            </div>
            <p className="text-xs text-muted-foreground">PDF files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {videoCount}
            </div>
            <p className="text-xs text-muted-foreground">Video lectures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarked</CardTitle>
            <BookmarkCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {bookmarkedResources.length}
            </div>
            <p className="text-xs text-muted-foreground">Saved resources</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-xl">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            All Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger
            value="bookmarked"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            Bookmarked ({bookmarkedResources.length})
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            Recent
          </TabsTrigger>
        </TabsList>

        {/* All Resources */}
        <TabsContent value="all">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            {resources.map((resource) => (
              <motion.div key={resource.id} variants={item}>
                <Card className="hover:shadow-md transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          resource.type === "document" && "bg-blue-50",
                          resource.type === "video" && "bg-purple-50",
                          resource.type === "link" && "bg-green-50",
                        )}
                      >
                        {getTypeIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg line-clamp-1">
                            {resource.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                          >
                            {resource.bookmarked ? (
                              <BookmarkCheck className="h-4 w-4 text-orange-600" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {resource.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge
                            className={cn(
                              "capitalize",
                              getTypeColor(resource.type),
                            )}
                          >
                            {resource.type}
                          </Badge>
                          <Badge variant="outline">{resource.subject}</Badge>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {resource.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {resource.views} views
                          </div>
                          {resource.type !== "video" &&
                            resource.type !== "link" && (
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {resource.downloads} downloads
                              </div>
                            )}
                          {resource.type === "video" && (
                            <div className="flex items-center gap-1">
                              {resource.duration}
                            </div>
                          )}
                          {resource.size && <div>{resource.size}</div>}
                        </div>

                        <div className="text-xs text-muted-foreground mb-4">
                          Uploaded by {resource.uploadedBy} on{" "}
                          {resource.uploadDate}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {resource.type === "link" ? (
                              <>
                                <LinkIcon className="mr-2 h-3 w-3" />
                                Open Link
                              </>
                            ) : resource.type === "video" ? (
                              <>
                                <Eye className="mr-2 h-3 w-3" />
                                Watch
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-3 w-3" />
                                Download
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="mr-2 h-3 w-3" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Bookmarked Resources */}
        <TabsContent value="bookmarked">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            {bookmarkedResources.map((resource) => (
              <motion.div key={resource.id} variants={item}>
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          resource.type === "document" && "bg-blue-50",
                          resource.type === "video" && "bg-purple-50",
                          resource.type === "link" && "bg-green-50",
                        )}
                      >
                        {getTypeIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {resource.description}
                        </p>
                        <Badge variant="outline">{resource.subject}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Recent Resources */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added</CardTitle>
              <CardDescription>
                Latest resources uploaded by your teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>
                  Recent resources view will be implemented with backend
                  integration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
