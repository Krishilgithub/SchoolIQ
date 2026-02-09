import React from "react";

export function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white dark:bg-neutral-950 px-2 text-neutral-500">
          Or continue with
        </span>
      </div>
    </div>
  );
}
