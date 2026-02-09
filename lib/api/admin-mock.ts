// Types
export interface StatMetric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: "up" | "down" | "neutral";
  history: number[]; // for sparklines
}

export interface School {
  id: string;
  name: string;
  plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Suspended" | "Pending";
  users: number;
  revenue: number;
  health: number; // 0-100
  lastActive: string;
}

export interface Ticket {
  id: string;
  subject: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved";
  created: string;
  user: string;
}

export interface PlatformHealth {
  apiLatency: number; // ms
  dbLoad: number; // %
  errorRate: number; // %
  queueDepth: number;
}

// Mock Data Generators

export const generateHistory = (length: number = 7) =>
  Array.from({ length }, () => Math.floor(Math.random() * 100));

export async function getExecutiveStats(): Promise<StatMetric[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    {
      label: "Active Schools",
      value: "1,248",
      change: 12.5,
      trend: "up",
      history: generateHistory(),
    },
    {
      label: "Total Students",
      value: "450.2k",
      change: 8.2,
      trend: "up",
      history: generateHistory(),
    },
    {
      label: "MRR",
      value: "$142.5k",
      change: 2.1,
      trend: "up",
      history: generateHistory(),
    },
    {
      label: "Avg Uptime",
      value: "99.98%",
      change: 0.01,
      trend: "up",
      history: [99, 99, 99, 99, 100, 100, 100],
    },
    {
      label: "Open Tickets",
      value: 24,
      change: -5.4,
      trend: "down", // Good thing
      history: generateHistory(),
    },
  ];
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    apiLatency: 45 + Math.random() * 20,
    dbLoad: 32 + Math.random() * 15,
    errorRate: Math.random() * 0.5,
    queueDepth: Math.floor(Math.random() * 50),
  };
}

export async function getRecentSchools(): Promise<School[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      id: "s1",
      name: "Springfield High",
      plan: "Enterprise",
      status: "Active",
      users: 1240,
      revenue: 2400,
      health: 98,
      lastActive: "2m ago",
    },
    {
      id: "s2",
      name: "Willow Creek Academy",
      plan: "Pro",
      status: "Active",
      users: 850,
      revenue: 850,
      health: 92,
      lastActive: "15m ago",
    },
    {
      id: "s3",
      name: "Oak Ridge Elementary",
      plan: "Free",
      status: "Pending",
      users: 120,
      revenue: 0,
      health: 100,
      lastActive: "1h ago",
    },
    {
      id: "s4",
      name: "Pine Valley School",
      plan: "Pro",
      status: "Suspended",
      users: 2400,
      revenue: 2100,
      health: 45,
      lastActive: "2d ago",
    },
    {
      id: "s5",
      name: "Maplewood High",
      plan: "Enterprise",
      status: "Active",
      users: 3100,
      revenue: 5200,
      health: 99,
      lastActive: "5m ago",
    },
  ];
}

export async function getRecentTickets(): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return [
    {
      id: "T-1024",
      subject: "API Integration Failure",
      priority: "High",
      status: "Open",
      created: "10m ago",
      user: "Admin @ Springfield",
    },
    {
      id: "T-1023",
      subject: "Billing Cycle Error",
      priority: "Medium",
      status: "In Progress",
      created: "1h ago",
      user: "Finance @ Willow",
    },
    {
      id: "T-1022",
      subject: "Feature Request: Dark Mode",
      priority: "Low",
      status: "Open",
      created: "3h ago",
      user: "Teacher @ Oak Ridge",
    },
    {
      id: "T-1021",
      subject: "Login Timeout Issue",
      priority: "Critical",
      status: "Resolved",
      created: "5h ago",
      user: "System",
    },
  ];
}
