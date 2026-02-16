import Link from "next/link";
import { HeaderAuth } from "@/components/header-auth";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-6 w-1.5 rounded-sm bg-accent" />
          <span className="font-display text-lg font-bold tracking-tight text-text">
            BlogSaaS
          </span>
        </Link>
        <HeaderAuth />
      </div>
    </header>
  );
}
