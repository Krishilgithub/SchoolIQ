import { LucideIcon } from "lucide-react";

/**
 * Navigation item that can appear in the sidebar
 */
export interface NavItem {
  /** Display title */
  title: string;
  /** Navigation href */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional badge (number or alert string like "!") */
  badge?: number | string;
  /** Permission required to view this item */
  requiredPermission?: string;
  /** Nested navigation items */
  children?: NavItem[];
}

/**
 * Navigation group that can contain multiple items
 */
export interface NavGroup {
  /** Group title */
  title: string;
  /** Items in this group */
  items: NavItem[];
  /** Whether this group can be collapsed */
  collapsible?: boolean;
}

/**
 * Badge counts from backend
 */
export interface BadgeCounts {
  exams?: number;
  assignments?: number;
  attendance?: string;
  [key: string]: number | string | undefined;
}
