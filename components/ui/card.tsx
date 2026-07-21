import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-neo-lg border-neo-strong border-neo-ink text-neo-ink",
  {
    variants: {
      variant: {
        default: "bg-neo-white shadow-neo-lg",
        paper: "bg-neo-paper shadow-neo",
        muted: "bg-neo-canvas shadow-neo-sm",
        primary: "bg-neo-primary text-neo-white shadow-neo-lg",
        accent: "bg-neo-yellow shadow-neo-lg"
      },
      interactive: {
        true: "cursor-pointer transition-[box-shadow,transform] duration-neo ease-neo-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-xl focus-visible:outline-none focus-visible:shadow-neo-focus active:translate-x-1 active:translate-y-1 active:shadow-neo-pressed",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      interactive: false
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn("flex flex-col gap-1.5 p-5 sm:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="card-title"
    className={cn(
      "font-neo-display text-xl font-neo-heavy leading-tight tracking-neo",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-sm leading-6 text-neo-ink-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(
      "flex items-center gap-3 border-t-neo border-neo-ink px-5 py-4 sm:px-6",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants
};
