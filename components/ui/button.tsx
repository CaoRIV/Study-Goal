import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-neo border-neo-strong border-neo-ink font-neo-body text-sm font-extrabold shadow-neo transition-[background-color,border-color,color,box-shadow,transform] duration-neo ease-neo-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg focus-visible:outline-none focus-visible:shadow-neo-focus active:translate-x-1 active:translate-y-1 active:shadow-neo-pressed disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-neo-action text-neo-ink hover:bg-orange-400",
        primary:
          "bg-neo-primary text-neo-white hover:bg-neo-primary-strong",
        secondary:
          "bg-neo-mint text-neo-ink hover:bg-teal-300",
        outline:
          "bg-neo-white text-neo-ink hover:bg-neo-yellow",
        ghost:
          "border-transparent bg-transparent text-neo-ink shadow-none hover:border-neo-ink hover:bg-neo-yellow hover:shadow-neo-sm",
        destructive:
          "bg-neo-coral text-neo-ink hover:bg-red-400",
        success:
          "bg-neo-success text-neo-white hover:bg-green-700",
        link:
          "border-transparent bg-transparent text-neo-primary shadow-none underline-offset-4 hover:translate-x-0 hover:translate-y-0 hover:text-neo-primary-strong hover:underline hover:shadow-none active:translate-x-0 active:translate-y-0"
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-5",
        lg: "h-[52px] px-7 text-base",
        icon: "h-11 w-11 px-0",
        "icon-sm": "h-9 w-9 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
