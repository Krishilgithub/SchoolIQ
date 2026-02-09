import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string; description?: string }[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Progress Bar Container */}
      <div className="relative flex items-center justify-between w-full">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-100 rounded-full dark:bg-neutral-800 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 rounded-full -z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor:
                    isActive || isCompleted
                      ? "var(--brand-500)"
                      : "var(--background)",
                  borderColor:
                    isActive || isCompleted
                      ? "var(--brand-500)"
                      : "var(--border)",
                  scale: isActive ? 1.1 : 1,
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                  !isActive &&
                    !isCompleted &&
                    "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700",
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-white" : "text-neutral-400",
                    )}
                  >
                    {stepNumber}
                  </span>
                )}
              </motion.div>
              <div className="absolute top-10 w-32 text-center">
                <span
                  className={cn(
                    "text-xs font-medium block transition-colors duration-300",
                    isActive ? "text-brand-600" : "text-neutral-400",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
