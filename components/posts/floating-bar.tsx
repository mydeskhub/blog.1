"use client";

import { MessageCircle, Share, Bookmark } from "lucide-react";
import { ClapButton } from "@/components/posts/clap-button";

type FloatingBarProps = {
  postId: string;
  initialClaps: number;
  commentCount: number;
};

export function FloatingBar({ postId, initialClaps, commentCount }: FloatingBarProps) {
  function handleShare() {
    if (navigator.share) {
      void navigator.share({ url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 shadow-lg ring-1 ring-black/[0.04]">
      <ClapButton postId={postId} initialCount={initialClaps} />

      <div className="mx-1.5 h-4 w-px bg-line" />

      <button
        type="button"
        onClick={() => {
          document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors px-2 py-1"
      >
        <MessageCircle className="h-[18px] w-[18px]" />
        {commentCount > 0 && commentCount}
      </button>

      <div className="mx-1.5 h-4 w-px bg-line" />

      <button
        type="button"
        onClick={handleShare}
        className="p-1.5 text-muted hover:text-text transition-colors"
        title="Share"
      >
        <Share className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        className="p-1.5 text-muted hover:text-text transition-colors"
        title="Bookmark"
      >
        <Bookmark className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
