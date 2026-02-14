import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-surface p-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
