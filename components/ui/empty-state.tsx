import * as React from "react";

import { cn } from "@/lib/utils";

const EmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-state"
    className={cn(
      "flex flex-col items-center justify-center rounded-neo-lg border-neo-strong border-dashed border-neo-ink bg-neo-paper px-5 py-10 text-center sm:px-8",
      className
    )}
    {...props}
  />
));
EmptyState.displayName = "EmptyState";

const EmptyStateIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-state-icon"
    className={cn(
      "mb-5 flex h-14 w-14 items-center justify-center rounded-neo border-neo-strong border-neo-ink bg-neo-yellow text-neo-ink shadow-neo [&_svg]:h-6 [&_svg]:w-6",
      className
    )}
    {...props}
  />
));
EmptyStateIcon.displayName = "EmptyStateIcon";

const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="empty-state-title"
    className={cn(
      "font-neo-display text-xl font-neo-heavy tracking-neo text-neo-ink",
      className
    )}
    {...props}
  />
));
EmptyStateTitle.displayName = "EmptyStateTitle";

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="empty-state-description"
    className={cn(
      "mt-2 max-w-md text-sm font-medium leading-6 text-neo-ink-muted",
      className
    )}
    {...props}
  />
));
EmptyStateDescription.displayName = "EmptyStateDescription";

const EmptyStateActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-state-actions"
    className={cn("mt-6 flex flex-wrap justify-center gap-3", className)}
    {...props}
  />
));
EmptyStateActions.displayName = "EmptyStateActions";

export {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle
};
