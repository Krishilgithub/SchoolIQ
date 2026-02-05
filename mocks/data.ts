import { Student, MarkEntry, Announcement } from "@/types";

// Simple delay simulator
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockStudents: Student[] = Array.from({ length: 20 }).map(
  (_, i) => ({
    id: `std-${i + 1}`,
    name:
      [
        "Aarav Patel",
        "Diya Sharma",
        "Vihaan Singh",
        "Ananya Gupta",
        "Rohan Kumar",
        "Ishita Verma",
        "Aditya Rao",
        "Meera Reddy",
        "Kabir Joshi",
        "Sanya Malhotra",
      ][i % 10] + (i > 9 ? " II" : ""),
    email: `student${i + 1}@schooliq.edu`,
    role: "STUDENT",
    schoolId: "sch-001",
    grade: "10-A",
    rollNumber: (100 + i + 1).toString(),
    guardianName: "Parent of " + (i + 1),
    guardianContact: "+91 98765 43210",
    attendancePercentage: 85 + Math.floor(Math.random() * 15),
    riskScore: Math.floor(Math.random() * 20), // Mostly low risk
  }),
);

// Marks for a specific subject
export const generateMockMarks = (_subjectId: string): MarkEntry[] => {
  return mockStudents.map((student) => ({
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    maxMarks: 100,
    obtainedMarks: Math.floor(60 + Math.random() * 40),
    comments:
      Math.random() > 0.8 ? "Needs improvement in clarity." : "Good job!",
  }));
};

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "Annual Sports Day Registration",
    content:
      "Registration for the annual sports day keeps open until Friday. Please submit your names to the respective house captains.",
    date: "2024-03-10",
    author: "Principal Desk",
    priority: "HIGH",
    readBy: 85,
  },
  {
    id: "ann-2",
    title: "Exam Schedule Released",
    content:
      "The final term examination schedule has been uploaded to the portal.",
    date: "2024-03-08",
    author: "Academic Coordinator",
    priority: "HIGH",
    readBy: 92,
  },
  {
    id: "ann-3",
    title: "Canteen Menu Update",
    content:
      "New healthy options added to the canteen menu starting next week.",
    date: "2024-03-05",
    author: "Admin",
    priority: "LOW",
    readBy: 45,
  },
];
