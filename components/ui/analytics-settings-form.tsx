"use client";

import { useState } from "react";

type BlogAnalytics = {
  id: string;
  title: string;
  googleAnalyticsId: string | null;
  customAnalyticsScript: string | null;
};

export function AnalyticsSettingsForm({ blogs }: { blogs: BlogAnalytics[] }) {
  const [selectedBlogId, setSelectedBlogId] = useState(blogs[0]?.id ?? "");
  const selectedBlog = blogs.find((b) => b.id === selectedBlogId);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(selectedBlog?.googleAnalyticsId ?? "");
  const [customAnalyticsScript, setCustomAnalyticsScript] = useState(selectedBlog?.customAnalyticsScript ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function onChangeBlog(blogId: string) {
    setSelectedBlogId(blogId);
    const blog = blogs.find((b) => b.id === blogId);
    setGoogleAnalyticsId(blog?.googleAnalyticsId ?? "");
    setCustomAnalyticsScript(blog?.customAnalyticsScript ?? "");
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/blogs/analytics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blogId: selectedBlogId,
        googleAnalyticsId,
        customAnalyticsScript
      })
    });

    if (!response.ok) {
      setMessage("Failed to save analytics settings.");
      setSaving(false);
      return;
    }

    setMessage("Analytics settings saved.");
    setSaving(false);
  }

  if (!blogs.length) {
    return <p style={{ color: "var(--muted)" }}>No blog available for this account yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "0.7rem", maxWidth: 760 }}>
      <label>
        Blog
        <select className="select" value={selectedBlogId} onChange={(e) => onChangeBlog(e.target.value)}>
          {blogs.map((blog) => (
            <option key={blog.id} value={blog.id}>
              {blog.title}
            </option>
          ))}
        </select>
      </label>

      <label>
        Google Analytics Measurement ID
        <input
          className="input"
          value={googleAnalyticsId}
          onChange={(e) => setGoogleAnalyticsId(e.target.value)}
          placeholder="G-XXXXXXXXXX"
        />
      </label>

      <label>
        Custom analytics script
        <textarea
          className="textarea"
          value={customAnalyticsScript}
          onChange={(e) => setCustomAnalyticsScript(e.target.value)}
          placeholder="&lt;script&gt;...&lt;/script&gt;"
        />
      </label>

      <button className="button primary" type="button" disabled={saving || !selectedBlogId} onClick={save}>
        {saving ? "Saving..." : "Save analytics settings"}
      </button>

      {message && <p style={{ margin: 0, color: message.includes("Failed") ? "#b91c1c" : "var(--muted)" }}>{message}</p>}
    </div>
  );
}
