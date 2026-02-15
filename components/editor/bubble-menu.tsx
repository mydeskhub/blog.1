"use client";

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Link,
  Heading1,
  Heading2,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

type BubbleMenuProps = {
  editor: Editor;
};

function MenuButton({
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
        "rounded p-1.5 transition-colors",
        active ? "text-accent" : "text-gray-300 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function EditorBubbleMenu({ editor }: BubbleMenuProps) {
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const iconSize = "h-4 w-4";

  const setLink = useCallback(() => {
    if (linkInput.trim()) {
      editor
        .chain()
        .focus()
        .setLink({ href: linkInput.trim() })
        .run();
    }
    setShowLinkInput(false);
    setLinkInput("");
  }, [editor, linkInput]);

  if (showLinkInput) {
    return (
      <TiptapBubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
        className="flex items-center gap-1 rounded-lg bg-gray-900 px-2 py-1.5 shadow-lg"
      >
        <input
          type="url"
          placeholder="Paste link..."
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setLink();
            }
            if (e.key === "Escape") {
              setShowLinkInput(false);
              setLinkInput("");
            }
          }}
          className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-48 px-1"
          autoFocus
        />
        <button
          type="button"
          onClick={setLink}
          className="text-xs text-accent hover:text-white px-2 py-0.5"
        >
          Add
        </button>
      </TiptapBubbleMenu>
    );
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150 }}
      className="flex items-center gap-0.5 rounded-lg bg-gray-900 px-1.5 py-1 shadow-lg"
    >
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className={iconSize} />
      </MenuButton>

      <div className="mx-1 h-4 w-px bg-gray-600" />

      <MenuButton
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
          } else {
            setShowLinkInput(true);
          }
        }}
        active={editor.isActive("link")}
        title="Link"
      >
        <Link className={iconSize} />
      </MenuButton>

      <div className="mx-1 h-4 w-px bg-gray-600" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className={iconSize} />
      </MenuButton>
    </TiptapBubbleMenu>
  );
}
