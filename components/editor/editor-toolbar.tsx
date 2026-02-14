"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link,
  Image,
} from "lucide-react";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
};

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors",
        active ? "bg-accent/10 text-accent" : "text-muted hover:bg-gray-100 hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  const iconSize = "h-4 w-4";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line pb-2 mb-3">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <Code className={iconSize} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-line" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className={iconSize} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-line" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered list"
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus className={iconSize} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-line" />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Link URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <Link className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="Insert image by URL"
      >
        <Image className={iconSize} />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className={iconSize} />
        </ToolbarButton>
      </div>
    </div>
  );
}
