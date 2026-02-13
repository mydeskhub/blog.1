"use client";

import { useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { AIPane } from "@/components/editor/ai-pane";

type BlogOption = { id: string; name: string };

export function MediumEditor({ blogs }: { blogs: BlogOption[] }) {
  const [title, setTitle] = useState("");
  const [blogId, setBlogId] = useState(blogs[0]?.id ?? "");
  const [status, setStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link,
      Image,
      Placeholder.configure({ placeholder: "Tell your story..." })
    ],
    editorProps: {
      attributes: {
        class: "tiptap"
      }
    }
  });

  const wordCount = useMemo(() => {
    const text = editor?.getText() ?? "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [editor?.state]);

  async function saveArticle() {
    if (!editor) return;
    setSaving(true);
    setError(null);

    try {
      const content = editor.getJSON();
      const htmlContent = editor.getHTML();
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, blogId, status, content, htmlContent })
      });

      if (!response.ok) throw new Error("Failed to save article");

      const data = (await response.json()) as { id: string };
      window.location.href = `/dashboard/articles/${data.id}`;
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

    const result = await fetch("/api/articles/upload", {
      method: "POST",
      body: formData
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
    <div className="main-grid">
      <section className="editor-shell" onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) void onDropFile(file);
      }} onDragOver={(e) => e.preventDefault()}>
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
          <input className="input" style={{ flex: "1 1 300px" }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
          <select className="select" style={{ width: 260 }} value={blogId} onChange={(e) => setBlogId(e.target.value)}>
            {blogs.map((blog) => (
              <option key={blog.id} value={blog.id}>
                {blog.name}
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">Request review</option>
            <option value="PUBLISHED">Publish now</option>
          </select>
          <button className="button primary" disabled={saving || !title || !blogId} onClick={saveArticle}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div style={{ marginBottom: "0.7rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          {wordCount} words · Drop images directly into editor
        </div>

        <EditorContent editor={editor} />
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      </section>

      <AIPane
        onApply={applySuggestion}
        getSelection={() => editor?.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) ?? editor?.getText() ?? ""}
      />
    </div>
  );
}
