"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { NavGroup as NavGroupType } from "./types";
import { NavItem } from "./nav-item";

interface NavGroupProps {
  group: NavGroupType;
  defaultCollapsed?: boolean;
}

export function NavGroup({ group, defaultCollapsed = false }: NavGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="mb-4">
      {/* Group Header */}
      {group.collapsible ? (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-3 w-3" />
          </motion.div>
          <span>{group.title}</span>
        </button>
      ) : (
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          {group.title}
        </div>
      )}

      {/* Group Items */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            className="space-y-0.5"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {group.items.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
