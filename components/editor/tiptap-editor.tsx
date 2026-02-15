"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorBubbleMenu } from "@/components/editor/bubble-menu";
import { EditorFloatingMenu } from "@/components/editor/floating-menu";
import { PublishModal } from "@/components/editor/publish-modal";
import { AIPane } from "@/components/editor/ai-pane";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";

type BlogOption = { id: string; name: string };

type PostData = {
  id: string;
  title: string;
  content: unknown;
  htmlContent?: string;
  blogId: string;
  status: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
};

type TiptapEditorProps = {
  blogs: BlogOption[];
  post?: PostData;
};

export function TiptapEditor({ blogs, post }: TiptapEditorProps) {
  const router = useRouter();
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [postId, setPostId] = useState(post?.id ?? "");
  const [blogId] = useState(post?.blogId ?? blogs[0]?.id ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishOpen, setPublishOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const titleRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({ placeholder: "Tell your story..." }),
      CharacterCount,
      Underline,
    ],
    content: post?.content as JSONContent | undefined,
    editorProps: {
      attributes: {
        class: "tiptap-medium",
      },
      handleDrop(view, event) {
        const file = event.dataTransfer?.files[0];
        if (file?.type.startsWith("image/")) {
          event.preventDefault();
          uploadImage(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: () => {
      scheduleSave();
    },
  });

  const wordCount = useMemo(() => {
    if (!editor) return 0;
    return editor.storage.characterCount?.words() ?? 0;
  }, [editor, editor?.state]);

  // Auto-save logic
  const doSave = useCallback(async () => {
    if (!editor || isSavingRef.current) return;
    if (!title.trim()) return;

    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const content = editor.getJSON();
      const htmlContent = editor.getHTML();

      if (postId) {
        // Update existing
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, htmlContent, summary: "Auto-save" }),
        });
        if (!res.ok) throw new Error("Save failed");
      } else {
        // Create new draft
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, blogId, status: "DRAFT", content, htmlContent }),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = (await res.json()) as { id: string };
        setPostId(data.id);
        router.replace(`/dashboard/posts/${data.id}/edit`, { scroll: false });
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [editor, title, postId, blogId, router]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void doSave();
    }, 2000);
  }, [doSave]);

  // Schedule save when title changes
  useEffect(() => {
    if (title.trim()) {
      scheduleSave();
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [title, scheduleSave]);

  async function uploadImage(file: File) {
    if (!editor || !file.type.startsWith("image/")) return;

    const formData = new FormData();
    formData.append("file", file);
    const result = await fetch("/api/upload", { method: "POST", body: formData });
    if (!result.ok) return;
    const data = (await result.json()) as { url: string };
    editor.chain().focus().setImage({ src: data.url }).run();
  }

  function applySuggestion(suggestion: string) {
    if (!editor) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`\n${suggestion}`).run();
    } else {
      editor.chain().focus().insertContent(suggestion).run();
    }
  }

  async function handlePublish(data: {
    blogId: string;
    coverImageUrl?: string;
    excerpt?: string;
    tags: string[];
    seoTitle?: string;
    seoDescription?: string;
    status: string;
  }) {
    if (!editor) return;

    // Ensure we have a saved post first
    let currentPostId = postId;
    if (!currentPostId) {
      const content = editor.getJSON();
      const htmlContent = editor.getHTML();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          blogId: data.blogId,
          status: "DRAFT",
          content,
          htmlContent,
        }),
      });
      if (!res.ok) return;
      const created = (await res.json()) as { id: string };
      currentPostId = created.id;
      setPostId(currentPostId);
    }

    // Now update with all publish metadata
    const content = editor.getJSON();
    const htmlContent = editor.getHTML();
    const res = await fetch(`/api/posts/${currentPostId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        htmlContent,
        status: data.status,
        coverImageUrl: data.coverImageUrl ?? null,
        excerpt: data.excerpt,
        tags: data.tags,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        summary: "Publish",
      }),
    });

    if (res.ok) {
      setPublishOpen(false);
      router.push(`/dashboard/posts/${currentPostId}`);
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.chain().focus().run();
    }
  }

  function handleTitlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function handleTitleInput(e: React.FormEvent<HTMLDivElement>) {
    setTitle(e.currentTarget.textContent ?? "");
  }

  return (
    <>
      <EditorHeader
        saveStatus={saveStatus}
        wordCount={wordCount}
        onPublish={() => setPublishOpen(true)}
        onToggleAI={() => setAiOpen(!aiOpen)}
        publishDisabled={!title.trim()}
      />

      <div className="max-w-[700px] mx-auto px-6 pt-12 pb-40">
        {/* Inline title */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Title"
          onKeyDown={handleTitleKeyDown}
          onPaste={handleTitlePaste}
          onInput={handleTitleInput}
          className="relative text-[42px] font-bold font-serif leading-[1.15] outline-none mb-6 text-text"
          style={{ minHeight: "1.2em" }}
        >
          {post?.title ?? ""}
        </div>

        {/* Editor with floating menu positioned relative to this container */}
        <div className="relative">
          <EditorContent editor={editor} />

          {/* Floating "+" menu on empty paragraphs */}
          {editor && (
            <EditorFloatingMenu
              editor={editor}
              onImageUpload={uploadImage}
            />
          )}
        </div>

        {/* Bubble menu (portaled via tippy, doesn't need relative parent) */}
        {editor && <EditorBubbleMenu editor={editor} />}
      </div>

      {/* Publish modal */}
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        blogs={blogs}
        initialData={{
          blogId: post?.blogId ?? blogId,
          coverImageUrl: post?.coverImageUrl,
          excerpt: post?.excerpt,
          tags: post?.tags ?? [],
          seoTitle: post?.seoTitle,
          seoDescription: post?.seoDescription,
          status: post?.status ?? "DRAFT",
        }}
        onPublish={handlePublish}
        isEdit={isEdit}
      />

      {/* AI drawer */}
      <AIPane
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onApply={applySuggestion}
        getSelection={() =>
          editor?.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
          ) ??
          editor?.getText() ??
          ""
        }
      />
    </>
  );
}
