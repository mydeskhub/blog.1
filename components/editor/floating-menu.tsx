"use client";

import type { Editor } from "@tiptap/react";
import { Plus, ImageIcon, Minus, Code, Video } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

type FloatingMenuProps = {
  editor: Editor;
  onImageUpload: (file: File) => void;
};

export function EditorFloatingMenu({ editor, onImageUpload }: FloatingMenuProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Track whether cursor is on an empty paragraph
  useEffect(() => {
    function update() {
      const { $from } = editor.state.selection;
      const node = $from.parent;
      const isEmpty = node.type.name === "paragraph" && node.content.size === 0;
      // Also check we're at the start of the node (not inside some other block)
      const isAtStart = $from.parentOffset === 0;
      setVisible(isEmpty && isAtStart && editor.isFocused);
      if (!isEmpty) setExpanded(false);
    }

    editor.on("selectionUpdate", update);
    editor.on("focus", update);
    editor.on("blur", () => {
      // Delay to allow clicking menu buttons
      setTimeout(() => {
        if (!menuRef.current?.contains(document.activeElement)) {
          setVisible(false);
          setExpanded(false);
        }
      }, 150);
    });

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("focus", update);
    };
  }, [editor]);

  // Close expanded menu on click outside
  useEffect(() => {
    if (!expanded) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [expanded]);

  const insertAction = useCallback(
    (action: () => void) => {
      action();
      setExpanded(false);
    },
    [],
  );

  if (!visible) return null;

  // Calculate position relative to editor
  const coords = editor.view.coordsAtPos(editor.state.selection.from);
  const editorRect = editor.view.dom.getBoundingClientRect();
  const top = coords.top - editorRect.top - 4;

  return (
    <div
      ref={menuRef}
      className="absolute"
      style={{
        top,
        left: -52,
      }}
    >
      {/* "+" trigger button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex h-[33px] w-[33px] items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-text hover:border-text transition-all"
      >
        <Plus
          className="h-5 w-5 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(45deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Expanded options */}
      {expanded && (
        <div className="absolute left-10 top-0 flex items-center gap-1 whitespace-nowrap">
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

          <FloatingOption
            icon={<ImageIcon className="h-4 w-4" />}
            label="Image"
            onClick={() => insertAction(() => fileInputRef.current?.click())}
          />

          <FloatingOption
            icon={<Minus className="h-4 w-4" />}
            label="Divider"
            onClick={() =>
              insertAction(() =>
                editor.chain().focus().setHorizontalRule().run(),
              )
            }
          />

          <FloatingOption
            icon={<Code className="h-4 w-4" />}
            label="Code"
            onClick={() =>
              insertAction(() =>
                editor.chain().focus().toggleCodeBlock().run(),
              )
            }
          />

          <FloatingOption
            icon={<Video className="h-4 w-4" />}
            label="Embed"
            onClick={() =>
              insertAction(() => {
                // Insert a placeholder paragraph for paste-to-embed
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: "paragraph",
                    content: [{ type: "text", text: "Paste a video or embed URL..." }],
                  })
                  .run();
                // Select the text so user can type over it
                editor.commands.selectAll();
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function FloatingOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-muted hover:text-text hover:border-gray-400 shadow-sm transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
