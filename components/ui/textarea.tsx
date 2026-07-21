import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn("form-input h-auto min-h-28 resize-y py-3", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
