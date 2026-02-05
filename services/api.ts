import {
  mockStudents,
  mockAnnouncements,
  generateMockMarks,
  delay,
} from "@/mocks/data";
import { Student, Announcement, MarkEntry } from "@/types";

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      await delay(800);
      if (email === "demo@schooliq.com" && password === "demo") {
        return {
          user: {
            id: "u-1",
            name: "Rahul Verma",
            email: "rahul@schooliq.edu",
            role: "TEACHER",
            schoolId: "sch-001",
            avatar: "https://github.com/shadcn.png",
          },
          token: "mock-jwt-token",
        };
      }
      throw new Error("Invalid credentials");
    },
    logout: async () => {
      await delay(500);
    },
  },
  students: {
    list: async (): Promise<Student[]> => {
      await delay(600);
      return mockStudents;
    },
    get: async (id: string): Promise<Student | undefined> => {
      await delay(400);
      return mockStudents.find((s) => s.id === id);
    },
    getWebProfile: async (id: string) => {
      await delay(800);
      return {
        ...mockStudents.find((s) => s.id === id),
        academicHistory: [
          { term: "Term 1", percentage: 88 },
          { term: "Term 2", percentage: 89 },
          { term: "Mid-Term", percentage: 91 },
        ],
        skills: ["Leadership", "Public Speaking", "Mathematics"],
      };
    },
  },
  academics: {
    getMarks: async (subjectId: string): Promise<MarkEntry[]> => {
      await delay(1000); // Simulate heavier load
      return generateMockMarks(subjectId);
    },
    submitMarks: async (_data: MarkEntry[]) => {
      await delay(1500);
      return { success: true, message: "Marks published successfully" };
    },
  },
  communication: {
    getAnnouncements: async (): Promise<Announcement[]> => {
      await delay(500);
      return mockAnnouncements;
    },
  },
};
