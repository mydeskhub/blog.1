import { cn } from "@/lib/utils";
import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, size = 32, className }: AvatarProps) {
  const initials = (name ?? "?").charAt(0).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "Avatar"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
