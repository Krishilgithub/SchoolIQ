// Dashboard types and interfaces

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  attendanceRate: number;
  pendingNotifications: number;
  recentEnrollments: number;
  trends: {
    students: TrendData;
    teachers: TrendData;
  };
}

export interface TrendData {
  value: number;
  direction: "up" | "down" | "neutral";
  percentage: number;
}

export interface QuickAction {
  label: string;
  icon: string; // Icon name from lucide-react
  href: string;
  permission?: string;
  color: "blue" | "green" | "amber" | "purple" | "pink";
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  type: "exam" | "holiday" | "deadline" | "event";
  description?: string;
}
