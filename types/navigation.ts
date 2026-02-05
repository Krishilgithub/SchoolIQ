import { LucideIcon } from "lucide-react";
import { Permission, Role } from "./auth";

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  variant?: "default" | "ghost";
  items?: NavItem[]; // Recursive for nested menus
  roles?: Role[]; // Which roles can see this
  permissions?: Permission[]; // Which permissions are required
  disabled?: boolean;
  external?: boolean;
  label?: string; // e.g. "New" badge
}

export interface NavGroup {
  title?: string; // Group header (e.g. "Academics")
  items: NavItem[];
  collapsed?: boolean;
}

export interface CommandItem {
  title: string;
  href?: string;
  action?: () => void;
  icon?: LucideIcon;
  keywords?: string[];
  shortcut?: string[]; // e.g. ["ctrl", "s"]
  group: "Navigation" | "Actions" | "Settings" | "Recent";
}
