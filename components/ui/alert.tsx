import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-neo-lg border-neo-strong border-neo-ink p-4 text-neo-ink shadow-neo-sm [&>svg]:mt-0.5 [&>svg]:h-5 [&>svg]:w-5",
  {
    variants: {
      variant: {
        default: "bg-neo-white",
        info: "bg-neo-sky",
        success: "bg-neo-mint",
        warning: "bg-neo-yellow",
        destructive: "bg-neo-coral"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    data-slot="alert-title"
    className={cn("font-neo-display font-neo-heavy leading-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-description"
    className={cn("col-start-2 text-sm font-medium leading-6", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle, alertVariants };
