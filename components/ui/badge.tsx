import { cn } from "@/lib/utils";

type BadgeProps = {
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-red-700",
  muted: "bg-gray-50 text-muted",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
