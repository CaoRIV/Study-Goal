import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressIndicatorVariants = cva(
  "h-full border-r-2 border-neo-ink transition-[width] duration-neo-slow ease-neo-out",
  {
    variants: {
      variant: {
        default: "bg-neo-primary",
        success: "bg-neo-success",
        warning: "bg-neo-yellow",
        destructive: "bg-neo-coral"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressIndicatorVariants> {
  label: string;
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, label, value = 0, max = 100, variant, ...props }, ref) => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const safeValue = Number.isFinite(value)
      ? Math.min(Math.max(value, 0), safeMax)
      : 0;
    const percentage = (safeValue / safeMax) * 100;

    return (
      <div
        ref={ref}
        data-slot="progress"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className={cn(
          "h-5 w-full overflow-hidden rounded-neo-sm border-neo-strong border-neo-ink bg-neo-white shadow-neo-xs",
          className
        )}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className={cn(
            progressIndicatorVariants({ variant }),
            percentage === 100 && "border-r-0"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress, progressIndicatorVariants };
