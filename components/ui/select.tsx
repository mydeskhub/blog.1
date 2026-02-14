import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
