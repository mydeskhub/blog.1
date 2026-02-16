"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  replies?: Comment[];
};

export function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then((res) => res.json())
      .then((data) => setComments(data as Comment[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body }),
      });

      if (!res.ok) throw new Error();
      const comment = (await res.json()) as Comment;
      setComments((prev) => [comment, ...prev]);
      setBody("");
    } catch {
      // Silent fail - user can retry
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="comments">
      <h2 className="font-display text-xl font-bold mb-6">
        Responses {comments.length > 0 && `(${comments.length})`}
      </h2>

      {session?.user && (
        <form onSubmit={submitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <Avatar
              src={session.user.image}
              name={session.user.name}
              size={32}
              className="mt-1 shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full border-0 border-b border-transparent bg-transparent px-0 py-2 text-sm outline-none min-h-[40px] resize-none focus:border-line transition-colors placeholder:text-muted"
              />
              {body.trim() && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Respond"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-24 rounded bg-line mb-2" />
              <div className="h-3 w-full rounded bg-line" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted py-4">
          No responses yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar
                  src={comment.author.image}
                  name={comment.author.name}
                  size={32}
                />
                <div>
                  <span className="text-sm font-medium text-text">
                    {comment.author.name ?? "Reader"}
                  </span>
                  <span className="text-xs text-muted ml-2">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text leading-relaxed pl-[42px]">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
