import Link from "next/link";
import { PenLine } from "lucide-react";
import { HeaderAuth } from "@/components/header-auth";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-text">
          <PenLine className="h-5 w-5 text-accent" />
          BlogSaaS
        </Link>
        <HeaderAuth />
      </div>
    </header>
  );
}
