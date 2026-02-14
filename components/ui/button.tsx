import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-accent-foreground hover:opacity-90": variant === "primary",
            "border border-line bg-surface text-text hover:bg-gray-50": variant === "secondary",
            "text-muted hover:text-text hover:bg-gray-50": variant === "ghost",
            "bg-danger text-white hover:opacity-90": variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
