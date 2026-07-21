import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, wrapperClassName, ...props }, ref) => (
    <div
      className={cn("relative", wrapperClassName)}
      data-slot="select-wrapper"
    >
      <select
        ref={ref}
        data-slot="select"
        className={cn(
          "form-input appearance-none pr-11 disabled:pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neo-ink"
      />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
