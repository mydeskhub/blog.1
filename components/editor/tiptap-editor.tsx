"use client";

import { useMemo, useState, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { AIPane } from "@/components/editor/ai-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";
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
};

type TiptapEditorProps = {
  blogs: BlogOption[];
  post?: PostData;
};

export function TiptapEditor({ blogs, post }: TiptapEditorProps) {
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [blogId, setBlogId] = useState(post?.blogId ?? blogs[0]?.id ?? "");
  const [status, setStatus] = useState(post?.status ?? "DRAFT");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({ placeholder: "Tell your story..." }),
    ],
    content: post?.content as JSONContent | undefined,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  const wordCount = useMemo(() => {
    const text = editor?.getText() ?? "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [editor?.state]);

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags((prev) => [...prev, tag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  async function savePost() {
    if (!editor) return;
    setSaving(true);
    setError(null);

    try {
      const content = editor.getJSON();
      const htmlContent = editor.getHTML();

      if (isEdit) {
        const response = await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            htmlContent,
            status,
            tags,
            summary: "Manual edit",
          }),
        });
        if (!response.ok) throw new Error("Failed to update post");
        window.location.href = `/dashboard/posts/${post.id}`;
      } else {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            blogId,
            status,
            content,
            htmlContent,
            tags,
          }),
        });
        if (!response.ok) throw new Error("Failed to save post");
        const data = (await response.json()) as { id: string };
        window.location.href = `/dashboard/posts/${data.id}`;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  async function onDropFile(file: File) {
    if (!editor) return;
    if (!file.type.startsWith("image/")) return;

    const formData = new FormData();
    formData.append("file", file);

    const result = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!result.ok) return;
    const data = (await result.json()) as { url: string };
    editor.chain().focus().setImage({ src: data.url }).run();
  }

  function applySuggestion(suggestion: string) {
    if (!editor) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`\n${suggestion}`).run();
      return;
    }
    editor.chain().focus().insertContent(suggestion).run();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section
        className="min-h-[calc(100vh-140px)] rounded-2xl border border-line bg-white p-5"
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) void onDropFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Header controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            className="flex-1 min-w-[200px]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
          {!isEdit && (
            <Select
              className="w-auto min-w-[200px]"
              value={blogId}
              onChange={(e) => setBlogId(e.target.value)}
            >
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.name}
                </option>
              ))}
            </Select>
          )}
          <Select
            className="w-auto min-w-[160px]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">Request review</option>
            <option value="PUBLISHED">Publish now</option>
          </Select>
          <Button
            variant="primary"
            disabled={saving || !title || !blogId}
            onClick={savePost}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Save"}
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-text"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted hover:text-text"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {tags.length < 10 && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag..."
              className="border-none bg-transparent text-xs outline-none placeholder:text-muted w-24"
            />
          )}
        </div>

        {/* Word count */}
        <div className="mb-3 text-xs text-muted">
          {wordCount} words &middot; Drop images into editor
        </div>

        {/* Toolbar + Editor */}
        {editor && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} />
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </section>

      <AIPane
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
    </div>
  );
}
