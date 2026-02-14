"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, PenLine, Settings, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Posts", icon: FileText },
  { href: "/dashboard/new", label: "New post", icon: PenLine },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent/10 font-medium text-accent"
                : "text-muted hover:bg-gray-50 hover:text-text",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
