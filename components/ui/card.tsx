import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl bg-surface p-5 shadow-sm ring-1 ring-black/[0.04]", className)}
      {...props}
    >
      {children}
    </div>
  );
}
