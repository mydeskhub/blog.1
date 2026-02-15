"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { HandMetal } from "lucide-react";
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
  const [animating, setAnimating] = useState(false);
  const sessionClaps = useRef(0);

  async function handleClap() {
    if (!session?.user || sessionClaps.current >= 50) return;
    setClapping(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 200);

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
        sessionClaps.current += 1;
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
      disabled={clapping || !session?.user || sessionClaps.current >= 50}
      className={cn(
        "flex items-center gap-1.5 text-sm transition-colors px-2 py-1 rounded-full",
        clapped
          ? "text-accent"
          : "text-muted hover:text-accent",
        !session?.user && "cursor-default opacity-60",
      )}
      title={
        !session?.user
          ? "Sign in to clap"
          : sessionClaps.current >= 50
            ? "Max claps reached"
            : "Clap for this story"
      }
    >
      <HandMetal
        className={cn(
          "h-5 w-5 transition-transform",
          animating && "scale-125",
          clapped && "fill-accent/20",
        )}
      />
      {count > 0 && count}
    </button>
  );
}
