"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Inbox,
  Archive,
  AlertCircle,
  Search,
  Paperclip,
  Star,
  Trash2,
  ChevronLeft,
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1 },
};

// Mock messages
const messages = [
  {
    id: 1,
    from: "Dr. Smith",
    fromRole: "Teacher",
    subject: "Mathematics Assignment Extension",
    preview: "Your request for extension has been approved...",
    body: "Hi, Your request for extension on the Calculus assignment has been approved. The new deadline is February 20th. Make sure to submit quality work.",
    date: "2024-02-14",
    time: "10:30 AM",
    read: false,
    priority: "high",
    type: "assignment",
    avatar: "/avatars/smith.jpg",
  },
  {
    id: 2,
    from: "Prof. Johnson",
    fromRole: "Teacher",
    subject: "Physics Lab Report Feedback",
    preview: "Great work on your latest lab report...",
    body: "Great work on your latest lab report! Your analysis was thorough and well-presented. Keep it up!",
    date: "2024-02-13",
    time: "03:15 PM",
    read: false,
    priority: "normal",
    type: "feedback",
    avatar: "/avatars/johnson.jpg",
  },
  {
    id: 3,
    from: "Ms. Davis",
    fromRole: "Teacher",
    subject: "English Literature Discussion",
    preview: "Looking forward to tomorrow's class discussion...",
    body: "Looking forward to tomorrow's class discussion on Shakespeare. Please prepare your notes on the themes we discussed last week.",
    date: "2024-02-12",
    time: "11:00 AM",
    read: true,
    priority: "normal",
    type: "general",
    avatar: "/avatars/davis.jpg",
  },
  {
    id: 4,
    from: "Admin Office",
    fromRole: "Administrative",
    subject: "Fee Payment Reminder",
    preview: "This is a reminder about your upcoming fee payment...",
    body: "This is a reminder about your upcoming fee payment due on February 20th. Please ensure timely payment to avoid late fees.",
    date: "2024-02-11",
    time: "09:00 AM",
    read: true,
    priority: "high",
    type: "admin",
    avatar: "/avatars/admin.jpg",
  },
  {
    id: 5,
    from: "Dr. Brown",
    fromRole: "Teacher",
    subject: "Chemistry Exam Schedule",
    preview: "The midterm exam has been scheduled...",
    body: "The midterm exam has been scheduled for February 25th at 2:00 PM in Lab 3A. The exam will cover chapters 5-8.",
    date: "2024-02-10",
    time: "02:30 PM",
    read: true,
    priority: "normal",
    type: "exam",
    avatar: "/avatars/brown.jpg",
  },
];

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = messages.filter((m) => !m.read).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "urgent":
        return "text-red-700 font-bold";
      default:
        return "text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "exam":
        return "bg-red-100 text-red-700 border-red-300";
      case "feedback":
        return "bg-green-100 text-green-700 border-green-300";
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Inbox
        </Button>

        {/* Message Detail */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMessage.avatar} />
                  <AvatarFallback>{selectedMessage.from[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {selectedMessage.subject}
                  </CardTitle>
                  <CardDescription>
                    From {selectedMessage.from} ({selectedMessage.fromRole}) •{" "}
                    {selectedMessage.date} at {selectedMessage.time}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={getTypeColor(selectedMessage.type)}
                  variant="outline"
                >
                  {selectedMessage.type}
                </Badge>
                {selectedMessage.priority === "high" && (
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    High Priority
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="text-base leading-relaxed">
                {selectedMessage.body}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Send className="mr-2 h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCompose) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setShowCompose(false)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Inbox
        </Button>

        {/* Compose Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
            <CardDescription>Send a message to your teachers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Input placeholder="Select teacher..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input placeholder="Message subject..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea rows={10} placeholder="Type your message here..." />
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline">
                <Paperclip className="mr-2 h-4 w-4" />
                Attach File
              </Button>
              <Button variant="ghost" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Messages
          </h2>
          <p className="text-muted-foreground">
            Communicate with your teachers and school administration
          </p>
        </div>
        <Button
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => setShowCompose(true)}
        >
          <Send className="mr-2 h-4 w-4" />
          Compose Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-orange-600">{unreadCount} unread</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Mail className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">new messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {messages.filter((m) => m.priority === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">messages received</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          <motion.div variants={container} initial="hidden" animate="show">
            {messages.map((message) => (
              <motion.div key={message.id} variants={item}>
                <div
                  className={cn(
                    "p-4 border-b last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors",
                    !message.read && "bg-orange-50/30 dark:bg-orange-950/10",
                  )}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback>{message.from[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-semibold",
                              !message.read && "text-orange-600",
                            )}
                          >
                            {message.from}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.fromRole}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-xs capitalize",
                              getTypeColor(message.type),
                            )}
                          >
                            {message.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.priority === "high" && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {message.date} • {message.time}
                          </span>
                        </div>
                      </div>
                      <h4
                        className={cn(
                          "font-medium mb-1",
                          !message.read && "font-bold",
                        )}
                      >
                        {message.subject}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.preview}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
