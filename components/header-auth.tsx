"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-line" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/signin" className="text-sm text-muted hover:text-text transition-colors">
          Sign in
        </Link>
        <Link
          href="/signin"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm hover:brightness-110 transition-all"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="text-sm text-muted hover:text-text transition-colors">
        Dashboard
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border border-line bg-surface px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
