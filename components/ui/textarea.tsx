import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent",
          "min-h-[120px] resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
