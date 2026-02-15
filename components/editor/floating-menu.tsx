"use client";

import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { Plus, ImageIcon, Minus, Code } from "lucide-react";
import { useState, useRef } from "react";

type FloatingMenuProps = {
  editor: Editor;
  onImageUpload: (file: File) => void;
};

export function EditorFloatingMenu({ editor, onImageUpload }: FloatingMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <TiptapFloatingMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: "left" }}
      shouldShow={({ state }) => {
        const { $from } = state.selection;
        const currentNode = $from.parent;
        return (
          currentNode.type.name === "paragraph" &&
          currentNode.content.size === 0
        );
      }}
      className="flex items-center gap-1"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:text-text hover:border-text transition-all"
        style={{
          transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}
      >
        <Plus className="h-5 w-5" />
      </button>

      {expanded && (
        <div className="flex items-center gap-1 ml-1 animate-in fade-in slide-in-from-left-2 duration-200">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImageUpload(file);
                setExpanded(false);
              }
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add image"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:text-text hover:border-text transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run();
              setExpanded(false);
            }}
            title="Add divider"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:text-text hover:border-text transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run();
              setExpanded(false);
            }}
            title="Add code block"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:text-text hover:border-text transition-colors"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
      )}
    </TiptapFloatingMenu>
  );
}
