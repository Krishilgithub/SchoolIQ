import { v4 as uuidv4 } from "uuid";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "mention";
export type NotificationCategory =
  | "academic"
  | "system"
  | "communication"
  | "other";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  createdAt: string; // ISO string
  actionUrl?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Assignment Graded",
    message: "Your submission for 'Calculus Midterm' has been graded.",
    type: "success",
    category: "academic",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    actionUrl: "/dashboard/academics/grades/1",
  },
  {
    id: "2",
    title: "New Announcement",
    message: "School will be closed tomorrow due to severe weather.",
    type: "warning",
    category: "system",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "3",
    title: "Start of Semester Party",
    message: "Join us in the main hall for the welcome event!",
    type: "info",
    category: "communication",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "4",
    title: "Mr. Smith mentioned you",
    message: "@Kyle please review the attached document.",
    type: "mention",
    category: "communication",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
];

export class NotificationService {
  private static notifications = [...MOCK_NOTIFICATIONS];

  static async getNotifications(): Promise<Notification[]> {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate delay
    return [...this.notifications];
  }

  static async markAsRead(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
  }

  static async markAllAsRead(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  static async clearAll(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    this.notifications = [];
  }

  // Simulate receiving a new notification (poller/websocket)
  static generateRandomNotification(): Notification {
    const types: NotificationType[] = ["info", "success", "warning", "mention"];
    const titles = [
      "System Update",
      "New Message",
      "Audit Log",
      "Grade Posted",
    ];

    return {
      id: uuidv4(),
      title: titles[Math.floor(Math.random() * titles.length)],
      message: "This is a simulated real-time notification update.",
      type: types[Math.floor(Math.random() * types.length)],
      category: "other",
      read: false,
      createdAt: new Date().toISOString(),
    };
  }
}
