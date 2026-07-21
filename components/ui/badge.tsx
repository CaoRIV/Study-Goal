import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-neo-sm border-2 border-neo-ink px-2.5 py-1 font-neo-body text-xs font-extrabold leading-none shadow-neo-xs",
  {
    variants: {
      variant: {
        default: "bg-neo-primary text-neo-white",
        secondary: "bg-neo-mint text-neo-ink",
        accent: "bg-neo-yellow text-neo-ink",
        success: "bg-neo-success text-neo-white",
        warning: "bg-neo-yellow text-neo-ink",
        destructive: "bg-neo-coral text-neo-ink",
        outline: "bg-neo-white text-neo-ink"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
