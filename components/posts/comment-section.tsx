"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    <div>
      <h2 className="text-lg font-bold mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {session?.user && (
        <form onSubmit={submitComment} className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none min-h-[80px] resize-y focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={submitting || !body.trim()}
            >
              {submitting ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-24 rounded bg-line mb-2" />
              <div className="h-3 w-full rounded bg-line" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-line pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <Avatar
                  src={comment.author.image}
                  name={comment.author.name}
                  size={24}
                />
                <span className="text-sm font-medium">
                  {comment.author.name ?? "Reader"}
                </span>
                <span className="text-xs text-muted">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-text pl-8">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
