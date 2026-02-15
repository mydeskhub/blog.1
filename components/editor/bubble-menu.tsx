"use client";

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { Link2, Link2Off } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState, useEffect, useRef } from "react";

type BubbleMenuProps = {
  editor: Editor;
};

export function EditorBubbleMenu({ editor }: BubbleMenuProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Reset link input when selection changes
  useEffect(() => {
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor.state.selection.$from.pos, editor.state.selection.$to.pos]);

  const openLinkInput = useCallback(() => {
    const existing = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(existing ?? "");
    setShowLinkInput(true);
    // Focus after render
    setTimeout(() => linkInputRef.current?.focus(), 0);
  }, [editor]);

  const applyLink = useCallback(() => {
    const url = linkUrl.trim();
    if (url) {
      // Auto-add https if no protocol
      const href = /^https?:\/\//.test(url) ? url : `https://${url}`;
      editor.chain().focus().setLink({ href }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor]);

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
        // Keep menu visible while interacting with link input
        interactive: true,
      }}
      shouldShow={({ editor: e, from, to }) => {
        // Don't show on image selections or empty selections
        if (from === to) return false;
        if (e.isActive("image")) return false;
        return true;
      }}
      className="bubble-toolbar"
    >
      {showLinkInput ? (
        /* ── Link input mode ── */
        <div className="flex items-center gap-2 rounded-[10px] bg-[#1e1e1e] px-3 py-2 shadow-xl">
          <Link2 className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setShowLinkInput(false);
                setLinkUrl("");
                editor.chain().focus().run();
              }
            }}
            placeholder="Paste or type a link..."
            className="bg-transparent text-[14px] text-white placeholder:text-gray-500 outline-none w-56"
          />
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={removeLink}
              className="shrink-0 rounded p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove link"
            >
              <Link2Off className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={applyLink}
            className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-[12px] font-medium text-white transition-opacity hover:opacity-80"
          >
            Apply
          </button>
        </div>
      ) : (
        /* ── Formatting toolbar ── */
        <div className="flex items-center rounded-[10px] bg-[#1e1e1e] shadow-xl">
          {/* Inline formatting */}
          <div className="flex items-center px-1 py-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <span className="text-[15px] font-bold leading-none">B</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <span className="text-[15px] italic leading-none font-serif">I</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline (Ctrl+U)"
            >
              <span className="text-[15px] underline leading-none">U</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={openLinkInput}
              active={editor.isActive("link")}
              title="Add link (Ctrl+K)"
            >
              <Link2 className="h-[15px] w-[15px]" />
            </ToolbarButton>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-600" />

          {/* Block formatting */}
          <div className="flex items-center px-1 py-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive("heading", { level: 1 })}
              title="Large heading"
            >
              <span className="text-[16px] font-bold leading-none font-serif">T</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              title="Small heading"
            >
              <span className="text-[13px] font-bold leading-none font-serif">T</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Quote"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
              </svg>
            </ToolbarButton>
          </div>
        </div>
      )}
    </TiptapBubbleMenu>
  );
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        active
          ? "text-accent bg-white/10"
          : "text-gray-300 hover:text-white hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );
}
