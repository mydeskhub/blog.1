"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize,
  RectangleHorizontal,
  Trash2,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageAlignment } from "./custom-image";

type ImageToolbarProps = {
  editor: Editor;
};

export function ImageToolbar({ editor }: ImageToolbarProps) {
  const [show, setShow] = useState(false);
  const [altText, setAltText] = useState("");
  const [showAltInput, setShowAltInput] = useState(false);
  const [alignment, setAlignment] = useState<ImageAlignment>("center");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);

  const updateToolbar = useCallback(() => {
    if (!editor.isActive("image")) {
      setShow(false);
      setShowAltInput(false);
      return;
    }

    setShow(true);
    const attrs = editor.getAttributes("image");
    setAltText((attrs.alt as string) ?? "");
    setAlignment((attrs["data-align"] as ImageAlignment) ?? "center");

    // Position above the selected image
    const { from } = editor.state.selection;
    const domNode = editor.view.nodeDOM(from);
    if (domNode instanceof HTMLElement) {
      const img = domNode.tagName === "IMG" ? domNode : domNode.querySelector("img");
      if (img) {
        const editorContainer = editor.view.dom.closest(".relative");
        if (editorContainer) {
          const containerRect = editorContainer.getBoundingClientRect();
          const imgRect = img.getBoundingClientRect();
          setPos({
            top: imgRect.top - containerRect.top - 48,
            left: imgRect.left - containerRect.left + imgRect.width / 2,
            width: imgRect.width,
          });
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    editor.on("selectionUpdate", updateToolbar);
    editor.on("transaction", updateToolbar);
    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("transaction", updateToolbar);
    };
  }, [editor, updateToolbar]);

  const setImageAlignment = useCallback(
    (align: ImageAlignment) => {
      editor.chain().focus().updateAttributes("image", { "data-align": align }).run();
      setAlignment(align);
    },
    [editor],
  );

  const updateAlt = useCallback(() => {
    editor.chain().focus().updateAttributes("image", { alt: altText }).run();
    setShowAltInput(false);
  }, [editor, altText]);

  const deleteImage = useCallback(() => {
    editor.chain().focus().deleteSelection().run();
    setShow(false);
  }, [editor]);

  if (!show) return null;

  return (
    <div
      ref={toolbarRef}
      className="absolute z-30 flex flex-col items-center"
      style={{
        top: pos.top,
        left: pos.left,
        transform: "translateX(-50%)",
      }}
    >
      {showAltInput ? (
        /* Alt text input mode */
        <div className="flex items-center gap-2 rounded-lg bg-white border border-line px-3 py-2 shadow-lg">
          <Type className="h-3.5 w-3.5 text-muted shrink-0" />
          <input
            ref={altInputRef}
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                updateAlt();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setShowAltInput(false);
              }
            }}
            placeholder="Describe this image for accessibility..."
            className="bg-transparent text-sm text-text placeholder:text-muted/60 outline-none w-64"
            autoFocus
          />
          <button
            type="button"
            onClick={updateAlt}
            className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-80 transition-opacity"
          >
            Save
          </button>
        </div>
      ) : (
        /* Alignment + actions toolbar */
        <div className="flex items-center gap-0.5 rounded-lg bg-white border border-line px-1.5 py-1 shadow-lg">
          <AlignButton
            active={alignment === "left"}
            onClick={() => setImageAlignment("left")}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </AlignButton>

          <AlignButton
            active={alignment === "center"}
            onClick={() => setImageAlignment("center")}
            title="Center"
          >
            <AlignCenter className="h-4 w-4" />
          </AlignButton>

          <AlignButton
            active={alignment === "right"}
            onClick={() => setImageAlignment("right")}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </AlignButton>

          <div className="w-px h-5 bg-line mx-0.5" />

          <AlignButton
            active={alignment === "wide"}
            onClick={() => setImageAlignment("wide")}
            title="Wide"
          >
            <RectangleHorizontal className="h-4 w-4" />
          </AlignButton>

          <AlignButton
            active={alignment === "full"}
            onClick={() => setImageAlignment("full")}
            title="Full width"
          >
            <Maximize className="h-4 w-4" />
          </AlignButton>

          <div className="w-px h-5 bg-line mx-0.5" />

          <AlignButton
            active={false}
            onClick={() => {
              setShowAltInput(true);
              setTimeout(() => altInputRef.current?.focus(), 0);
            }}
            title={altText ? `Alt: "${altText}"` : "Add alt text"}
          >
            <span className="text-[11px] font-semibold leading-none">Alt</span>
          </AlignButton>

          <AlignButton
            active={false}
            onClick={deleteImage}
            title="Remove image"
            danger
          >
            <Trash2 className="h-4 w-4" />
          </AlignButton>
        </div>
      )}
    </div>
  );
}

function AlignButton({
  active,
  onClick,
  children,
  title,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-accent/10 text-accent"
          : danger
            ? "text-muted hover:text-danger hover:bg-danger/5"
            : "text-muted hover:text-text hover:bg-gray-100",
      )}
    >
      {children}
    </button>
  );
}
