"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type ClapButtonProps = {
  postId: string;
  initialCount: number;
};

export function ClapButton({ postId, initialCount }: ClapButtonProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState(initialCount);
  const [clapping, setClapping] = useState(false);
  const [clapped, setClapped] = useState(false);

  async function handleClap() {
    if (!session?.user) return;
    setClapping(true);

    try {
      const res = await fetch("/api/claps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, count: 1 }),
      });

      if (res.ok) {
        const data = (await res.json()) as { totalClaps: number };
        setCount(data.totalClaps);
        setClapped(true);
      }
    } catch {
      // Silent fail
    } finally {
      setClapping(false);
    }
  }

  return (
    <button
      onClick={handleClap}
      disabled={clapping || !session?.user}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        clapped
          ? "border-accent/30 bg-accent/5 text-accent"
          : "border-line text-muted hover:border-accent hover:text-accent",
        !session?.user && "cursor-default opacity-60",
      )}
      title={session?.user ? "Clap for this post" : "Sign in to clap"}
    >
      <Heart
        className={cn("h-4 w-4", clapped && "fill-accent")}
      />
      {count}
    </button>
  );
}
