"use client";

import Link from "next/link";
import { PenLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type EditorHeaderProps = {
  saveStatus: "idle" | "saving" | "saved" | "error";
  wordCount: number;
  onPublish: () => void;
  onToggleAI: () => void;
  publishDisabled?: boolean;
};

export function EditorHeader({
  saveStatus,
  wordCount,
  onPublish,
  onToggleAI,
  publishDisabled,
}: EditorHeaderProps) {
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white/90 backdrop-blur px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors"
        >
          <PenLine className="h-4 w-4" />
          <span className="hidden sm:inline">Draft</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">
          {wordCount > 0 && `${readTime} min read`}
        </span>

        <span
          className={cn(
            "text-xs",
            saveStatus === "saving" && "text-muted",
            saveStatus === "saved" && "text-accent",
            saveStatus === "error" && "text-danger",
            saveStatus === "idle" && "text-muted",
          )}
        >
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "error" && "Error saving"}
          {saveStatus === "idle" && ""}
        </span>

        <button
          type="button"
          onClick={onToggleAI}
          className="rounded-full p-2 text-muted hover:bg-gray-100 hover:text-text transition-colors"
          title="AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={publishDisabled}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
        >
          Publish
        </button>
      </div>
    </header>
  );
}
