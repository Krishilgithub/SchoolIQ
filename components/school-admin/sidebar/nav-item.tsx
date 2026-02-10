"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavItem as NavItemType } from "./types";

interface NavItemProps {
  item: NavItemType;
  depth?: number;
}

export function NavItem({ item, depth = 0 }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link href={item.href}>
      <motion.div
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-orange-50/50 hover:shadow-sm",
          isActive &&
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200/50",
          !isActive && "text-gray-700 hover:text-orange-600",
          depth > 0 && "ml-4",
        )}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <item.icon
          className={cn(
            "h-4 w-4 flex-shrink-0",
            isActive && "text-white",
            !isActive && "text-gray-500",
          )}
        />

        <span className="flex-1 truncate">{item.title}</span>

        {item.badge && (
          <motion.span
            className={cn(
              "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
              typeof item.badge === "number" && "bg-orange-500 text-white",
              item.badge === "!" && "bg-red-500 text-white",
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {item.badge}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}
