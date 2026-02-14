import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
