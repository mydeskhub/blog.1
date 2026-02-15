"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronDown, ImageIcon } from "lucide-react";

type BlogOption = { id: string; name: string };

type PublishData = {
  blogId: string;
  coverImageUrl?: string;
  excerpt?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: string;
};

type PublishModalProps = {
  isOpen: boolean;
  onClose: () => void;
  blogs: BlogOption[];
  initialData: PublishData;
  onPublish: (data: PublishData) => void;
  isEdit?: boolean;
};

export function PublishModal({
  isOpen,
  onClose,
  blogs,
  initialData,
  onPublish,
  isEdit,
}: PublishModalProps) {
  const [blogId, setBlogId] = useState(initialData.blogId);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData.coverImageUrl ?? "");
  const [excerpt, setExcerpt] = useState(initialData.excerpt ?? "");
  const [tags, setTags] = useState<string[]>(initialData.tags);
  const [tagInput, setTagInput] = useState("");
  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData.seoDescription ?? "");
  const [status, setStatus] = useState(initialData.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
  const [seoOpen, setSeoOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBlogId(initialData.blogId);
      setCoverImageUrl(initialData.coverImageUrl ?? "");
      setExcerpt(initialData.excerpt ?? "");
      setTags(initialData.tags);
      setSeoTitle(initialData.seoTitle ?? "");
      setSeoDescription(initialData.seoDescription ?? "");
      setStatus(initialData.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags((prev) => [...prev, tag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  async function handleCoverUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) return;
      const data = (await res.json()) as { url: string };
      setCoverImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  function handlePublish() {
    onPublish({
      blogId,
      coverImageUrl: coverImageUrl || undefined,
      excerpt: excerpt || undefined,
      tags,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      status,
    });
  }

  if (!isOpen) return null;

  const actionLabel =
    status === "PUBLISHED"
      ? "Publish now"
      : status === "IN_REVIEW"
        ? "Submit for review"
        : "Save as draft";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl mx-4 max-h-[90vh] overflow-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted hover:text-text hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-text mb-6">
          {isEdit ? "Update story" : "Publish your story"}
        </h2>

        <div className="space-y-5">
          {/* Blog selector (new posts only) */}
          {!isEdit && blogs.length > 1 && (
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">
                Publication
              </label>
              <select
                value={blogId}
                onChange={(e) => setBlogId(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {blogs.map((blog) => (
                  <option key={blog.id} value={blog.id}>
                    {blog.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cover image */}
          <div>
            <label className="text-sm font-medium text-text mb-1.5 block">
              Cover image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
                e.target.value = "";
              }}
            />
            {coverImageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-line">
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line py-8 text-sm text-muted hover:border-accent hover:text-accent transition-colors"
              >
                <ImageIcon className="h-5 w-5" />
                {uploading ? "Uploading..." : "Add a cover image"}
              </button>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-sm font-medium text-text mb-1.5 block">
              Preview subtitle
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief description..."
              maxLength={240}
              rows={2}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none resize-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <p className="text-xs text-muted mt-1">{excerpt.length}/240</p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-text mb-1.5 block">
              Tags <span className="text-muted font-normal">(up to 5)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-text"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    className="text-muted hover:text-text"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            )}
          </div>

          {/* SEO section (collapsible) */}
          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex items-center gap-2 text-sm font-medium text-text w-full"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${seoOpen ? "rotate-180" : ""}`}
              />
              SEO settings
            </button>

            {seoOpen && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted mb-1 block">
                    SEO title <span className="text-muted">({seoTitle.length}/70)</span>
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value.slice(0, 70))}
                    placeholder="Custom title for search engines"
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted mb-1 block">
                    SEO description <span className="text-muted">({seoDescription.length}/160)</span>
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                    placeholder="Custom description for search engines"
                    rows={2}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none resize-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="border-t border-line pt-4">
            <label className="text-sm font-medium text-text mb-2 block">
              Status
            </label>
            <div className="space-y-2">
              {[
                { value: "DRAFT", label: "Save as draft" },
                { value: "IN_REVIEW", label: "Submit for review" },
                { value: "PUBLISHED", label: "Publish now" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
