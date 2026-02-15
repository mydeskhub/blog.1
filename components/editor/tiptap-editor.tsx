"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { CustomImage } from "@/components/editor/custom-image";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorBubbleMenu } from "@/components/editor/bubble-menu";
import { EditorFloatingMenu } from "@/components/editor/floating-menu";
import { ImageToolbar } from "@/components/editor/image-toolbar";
import { PublishModal } from "@/components/editor/publish-modal";
import { AIPane } from "@/components/editor/ai-pane";
import { useRouter } from "next/navigation";
import { ImageIcon, X, Loader2 } from "lucide-react";
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

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Upload failed");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function TiptapEditor({ blogs, post }: TiptapEditorProps) {
  const router = useRouter();
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [postId, setPostId] = useState(post?.id ?? "");
  const [blogId] = useState(post?.blogId ?? blogs[0]?.id ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishOpen, setPublishOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const uploadingCountRef = useRef(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
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
        const files = event.dataTransfer?.files;
        if (files?.length) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const currentEditor = editorRef.current;
            if (currentEditor) {
              void insertImageWithPreview(currentEditor, file);
            }
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              const currentEditor = editorRef.current;
              if (currentEditor) {
                void insertImageWithPreview(currentEditor, file);
              }
            }
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: () => {
      scheduleSave();
    },
  });

  editorRef.current = editor;

  // Insert image with instant blob preview, then swap to uploaded URL
  async function insertImageWithPreview(
    targetEditor: NonNullable<typeof editor>,
    file: File,
  ) {
    setUploadError(null);
    uploadingCountRef.current += 1;
    setImageUploading(true);

    // Create a local preview URL for instant feedback
    const previewUrl = URL.createObjectURL(file);

    // Insert image with uploading flag so CSS shows loading overlay
    targetEditor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: previewUrl,
          alt: "",
          "data-uploading": "true",
        },
      })
      .run();

    try {
      const realUrl = await uploadFile(file);

      // Find the image with the preview URL and swap to real URL
      let found = false;
      targetEditor.state.doc.descendants((node, pos) => {
        if (found) return false;
        if (node.type.name === "image" && node.attrs.src === previewUrl) {
          found = true;
          targetEditor.view.dispatch(
            targetEditor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              src: realUrl,
              "data-uploading": null,
            }),
          );
          return false;
        }
      });
    } catch (err) {
      // Remove the failed image and show error toast
      let found = false;
      targetEditor.state.doc.descendants((node, pos) => {
        if (found) return false;
        if (node.type.name === "image" && node.attrs.src === previewUrl) {
          found = true;
          targetEditor.view.dispatch(
            targetEditor.state.tr.delete(pos, pos + node.nodeSize),
          );
          return false;
        }
      });
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      URL.revokeObjectURL(previewUrl);
      uploadingCountRef.current -= 1;
      if (uploadingCountRef.current <= 0) {
        uploadingCountRef.current = 0;
        setImageUploading(false);
      }
    }
  }

  const wordCount = useMemo(() => {
    if (!editor) return 0;
    return editor.storage.characterCount?.words() ?? 0;
  }, [editor, editor?.state]);

  const doSave = useCallback(async () => {
    if (!editor || isSavingRef.current) return;
    if (!title.trim()) return;
    // Don't save while images are uploading (would save blob: URLs)
    if (uploadingCountRef.current > 0) return;

    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const content = editor.getJSON();
      const htmlContent = editor.getHTML();

      if (postId) {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            htmlContent,
            coverImageUrl: coverImageUrl || null,
            summary: "Auto-save",
          }),
        });
        if (!res.ok) throw new Error("Save failed");
      } else {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            blogId,
            status: "DRAFT",
            content,
            htmlContent,
            coverImageUrl: coverImageUrl || undefined,
          }),
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
  }, [editor, title, postId, blogId, coverImageUrl, router]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void doSave();
    }, 2000);
  }, [doSave]);

  useEffect(() => {
    if (title.trim()) {
      scheduleSave();
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [title, coverImageUrl, scheduleSave]);

  async function uploadImageToEditor(file: File) {
    if (!editor || !file.type.startsWith("image/")) return;
    await insertImageWithPreview(editor, file);
  }

  async function handleCoverUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setCoverUploading(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file);
      setCoverImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
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
        coverImageUrl: data.coverImageUrl ?? coverImageUrl ?? null,
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

      {/* Upload status toast */}
      {(imageUploading || coverUploading) && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-text px-4 py-2.5 text-sm text-white shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{coverUploading ? "Uploading cover image..." : "Uploading image..."}</span>
        </div>
      )}

      {/* Upload error toast */}
      {uploadError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-danger px-4 py-2.5 text-sm text-white shadow-lg animate-in">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-[700px] mx-auto px-6 pt-10 pb-40">
        {/* Cover image area */}
        <div className="mb-6">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleCoverUpload(file);
              e.target.value = "";
            }}
          />

          {coverImageUrl ? (
            <div className="group relative -mx-6">
              <img
                src={coverImageUrl}
                alt="Cover"
                className="w-full max-h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-text shadow hover:bg-white transition-colors"
                >
                  Change image
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="rounded-full bg-white/90 p-2 text-text shadow hover:bg-white transition-colors"
                  title="Remove cover"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="flex items-center gap-2 text-sm text-muted/60 hover:text-muted transition-colors py-2"
            >
              {coverUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
              {coverUploading ? "Uploading cover..." : "Add a cover image"}
            </button>
          )}
        </div>

        {/* Inline title */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Title"
          onKeyDown={handleTitleKeyDown}
          onPaste={handleTitlePaste}
          onInput={handleTitleInput}
          className="relative text-[42px] font-bold font-serif leading-[1.15] outline-none mb-2 text-text"
          style={{ minHeight: "1.2em" }}
        >
          {post?.title ?? ""}
        </div>

        {/* Editor with floating menu + image toolbar */}
        <div className="relative">
          <EditorContent editor={editor} />

          {editor && (
            <>
              <EditorFloatingMenu
                editor={editor}
                onImageUpload={uploadImageToEditor}
              />
              <ImageToolbar editor={editor} />
            </>
          )}
        </div>

        {/* Bubble menu */}
        {editor && <EditorBubbleMenu editor={editor} />}
      </div>

      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        blogs={blogs}
        initialData={{
          blogId: post?.blogId ?? blogId,
          coverImageUrl: coverImageUrl || post?.coverImageUrl,
          excerpt: post?.excerpt,
          tags: post?.tags ?? [],
          seoTitle: post?.seoTitle,
          seoDescription: post?.seoDescription,
          status: post?.status ?? "DRAFT",
        }}
        onPublish={handlePublish}
        isEdit={isEdit}
      />

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
