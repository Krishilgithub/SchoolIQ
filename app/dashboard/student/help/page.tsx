"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  FileText,
  Search,
  Send,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Mock FAQs
const faqs = [
  {
    id: 1,
    category: "Academics",
    question: "How do I submit an assignment?",
    answer:
      "Navigate to the Assignments page, select your assignment, click 'Submit Assignment', upload your file, and click 'Submit'. You'll receive a confirmation email once submitted.",
  },
  {
    id: 2,
    category: "Academics",
    question: "Can I resubmit an assignment after the deadline?",
    answer:
      "Late submissions may be allowed depending on your teacher's policy. Contact your teacher directly through the Messages section to request permission for late submission.",
  },
  {
    id: 3,
    category: "Attendance",
    question: "How is my attendance calculated?",
    answer:
      "Attendance is calculated as (Present Days / Total Days) × 100. You need to maintain at least 75% attendance to be eligible for exams.",
  },
  {
    id: 4,
    category: "Exams",
    question: "How do I view my exam schedule?",
    answer:
      "Go to the Exams & Tests page to see all upcoming exams, their dates, times, and venues. You can also add them to your calendar for reminders.",
  },
  {
    id: 5,
    category: "Technical",
    question: "I forgot my password. How do I reset it?",
    answer:
      "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions in the reset email. If you don't receive the email, check your spam folder.",
  },
  {
    id: 6,
    category: "Technical",
    question: "The website is not loading properly. What should I do?",
    answer:
      "Try clearing your browser cache, using a different browser, or checking your internet connection. If the problem persists, contact technical support.",
  },
  {
    id: 7,
    category: "Resources",
    question: "How do I download study materials?",
    answer:
      "Go to the Learning Resources page, find the material you need, and click the 'Download' button. You can also bookmark resources for quick access later.",
  },
  {
    id: 8,
    category: "Communication",
    question: "How do I contact my teacher?",
    answer:
      "Use the Messages section to send a message to your teacher. Select the teacher from the recipient list, write your message, and click 'Send'.",
  },
];

const quickLinks = [
  {
    id: 1,
    title: "Student Handbook",
    description: "Complete guide to student policies and procedures",
    icon: BookOpen,
    link: "#",
  },
  {
    id: 2,
    title: "Academic Calendar",
    description: "Important dates and academic schedules",
    icon: FileText,
    link: "#",
  },
  {
    id: 3,
    title: "Fee Payment Guide",
    description: "How to pay fees online and view receipts",
    icon: FileText,
    link: "#",
  },
  {
    id: 4,
    title: "Library Guidelines",
    description: "Rules and procedures for library usage",
    icon: BookOpen,
    link: "#",
  },
];

export default function HelpSupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Help & Support
        </h2>
        <p className="text-muted-foreground">
          Find answers to common questions or contact support for assistance
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-bold mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              support@schooliq.com
            </p>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              24-48 hour response
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold mb-1">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              +1 (555) 123-4567
            </p>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Mon-Fri, 9 AM - 5 PM
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with support team
            </p>
            <Button size="sm" variant="outline">
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-xl w-full md:w-auto">
          <TabsTrigger
            value="faqs"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQs
          </TabsTrigger>
          <TabsTrigger
            value="guides"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Guides
          </TabsTrigger>
          <TabsTrigger
            value="ticket"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Ticket
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-6">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-orange-50"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* FAQ List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredFaqs.map((faq) => (
              <motion.div key={faq.id} variants={item}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                          {faq.question}
                        </h3>
                        {expandedFaq === faq.id && (
                          <p className="text-muted-foreground mt-3">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredFaqs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  No FAQs found matching your search. Try different keywords or
                  submit a support ticket.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides">
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((link) => (
              <Card
                key={link.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                      <link.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Submit Ticket Tab */}
        <TabsContent value="ticket">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a detailed message
                and we'll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Subject
                </label>
                <Input
                  placeholder="Brief description of your issue..."
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message
                </label>
                <Textarea
                  rows={8}
                  placeholder="Provide detailed information about your issue..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Attachment (Optional)
                </label>
                <Input type="file" />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload screenshots or documents to help explain your issue
                </p>
              </div>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Ticket
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll receive a confirmation email with your ticket number.
                Average response time: 24-48 hours
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
